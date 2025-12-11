import Insight from '../models/AIInsight.js';
import Dataset from '../models/Dataset.js';
import { generateDatasetSummary, chatAboutDataset } from '../utils/aiClient.js';
import { parseFile } from '../utils/fileParser.js';
import pg from 'pg';
import mysql from 'mysql2/promise';
import { MongoClient } from 'mongodb';

/**
 * Helper to fetch sample data from dataset (file or external DB)
 */
const fetchSampleData = async (dataset, limit = 50) => {
  // If file-based dataset
  if (dataset.filePath) {
    const { data } = parseFile(dataset.filePath);
    return data.slice(0, limit);
  }

  // Fetch from external database
  const { connectionDetails, sourceType } = dataset;
  let data = [];

  if (sourceType === 'postgresql') {
    const { host, port, database, user, password, table } = connectionDetails;
    const client = new pg.Client({ host, port: port || 5432, database, user, password });
    try {
      await client.connect();
      const result = await client.query(`SELECT * FROM "${table}" LIMIT $1`, [limit]);
      data = result.rows;
      await client.end();
    } catch (err) {
      await client.end().catch(() => {});
      console.error('PostgreSQL fetch error:', err.message);
    }
  } else if (sourceType === 'mysql') {
    let connection;
    try {
      const { host, port, database, user, password, table } = connectionDetails;
      connection = await mysql.createConnection({ host, port: port || 3306, database, user, password });
      const [rows] = await connection.execute(`SELECT * FROM \`${table}\` LIMIT ?`, [limit]);
      data = rows;
      await connection.end();
    } catch (err) {
      if (connection) await connection.end().catch(() => {});
      console.error('MySQL fetch error:', err.message);
    }
  } else if (sourceType === 'mongodb') {
    const { uri, database, collection } = connectionDetails;
    const client = new MongoClient(uri);
    try {
      await client.connect();
      const db = client.db(database);
      const col = db.collection(collection);
      data = await col.find({}).limit(limit).toArray();
      await client.close();
    } catch (err) {
      await client.close().catch(() => {});
      console.error('MongoDB fetch error:', err.message);
    }
  }

  return data;
};

// POST /ai/summary/:datasetId - Generate AI summary for a dataset
const generateSummary = async (req, res) => {
  try {
    const { datasetId } = req.params;

    const dataset = await Dataset.findById(datasetId).populate('appSpaceId');
    if (!dataset) {
      return res.status(404).json({ error: 'Dataset not found' });
    }

    // Verify user owns the appSpace
    if (dataset.appSpaceId.userId.toString() !== req.user.userId) {
      return res.status(404).json({ error: 'Dataset not found' });
    }

    // Fetch first 50 rows from dataset
    const sampleData = await fetchSampleData(dataset, 50);

    // Generate summary using AI (or mock if no API key)
    const result = await generateDatasetSummary({
      datasetName: dataset.name,
      schema: dataset.schema,
      recordsCount: dataset.recordsCount,
      sampleData,
    });

    // Save insight with structured data (no verbose responseText)
    const insight = await Insight.create({
      datasetId,
      appSpaceId: dataset.appSpaceId._id, // Add appSpaceId from dataset
      type: 'summary',
      summary: result.summary, // Store the main summary text
      structuredData: {
        insights: result.insights,
        trendSummaries: result.trendSummaries || [],
      },
      chartSuggestions: result.chartSuggestions,
      createdBy: req.user.userId,
    });

    return res.status(201).json({
      insight,
      summary: result.summary,
      insights: result.insights,
      trendSummaries: result.trendSummaries || [],
      chartSuggestions: result.chartSuggestions,
    });
  } catch (err) {
    console.error('generateSummary error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

// POST /ai/chat/:datasetId - Chat with AI about a dataset
const chat = async (req, res) => {
  try {
    const { datasetId } = req.params;
    const { question } = req.body;

    if (!question) {
      return res.status(400).json({ error: 'Question is required' });
    }

    const dataset = await Dataset.findById(datasetId).populate('appSpaceId');
    if (!dataset) {
      return res.status(404).json({ error: 'Dataset not found' });
    }

    // Verify user owns the appSpace
    if (dataset.appSpaceId.userId.toString() !== req.user.userId) {
      return res.status(404).json({ error: 'Dataset not found' });
    }

    // Fetch sample data (works with files and external DBs)
    const sampleData = await fetchSampleData(dataset, 10);

    // Get previous chat history for context
    const previousChats = await Insight.find({ datasetId, type: 'chat' })
      .sort({ createdAt: -1 })
      .limit(5);

    const chatHistory = previousChats.reverse().flatMap((chat) => [
      { role: 'user', content: chat.prompt },
      { role: 'assistant', content: chat.chatResponse },
    ]);

    // Get AI response
    const response = await chatAboutDataset({
      question,
      datasetName: dataset.name,
      schema: dataset.schema,
      sampleData,
      chatHistory,
    });

    // Save chat insight
    const insight = await Insight.create({
      datasetId,
      appSpaceId: dataset.appSpaceId._id, // Add appSpaceId from dataset
      type: 'chat',
      summary: question, // Store question as summary for consistency
      prompt: question,
      chatResponse: response, // Changed from 'response' to 'chatResponse'
      createdBy: req.user.userId,
    });

    return res.status(201).json(insight);
  } catch (err) {
    console.error('chat error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

// GET /ai/insights/:datasetId - Get all insights for a dataset
const getInsights = async (req, res) => {
  try {
    const { datasetId } = req.params;
    const { type } = req.query;

    const dataset = await Dataset.findById(datasetId).populate('appSpaceId');
    if (!dataset) {
      return res.status(404).json({ error: 'Dataset not found' });
    }

    // Verify user owns the appSpace
    if (dataset.appSpaceId.userId.toString() !== req.user.userId) {
      return res.status(404).json({ error: 'Dataset not found' });
    }

    const query = { datasetId };
    if (type) {
      query.type = type;
    }

    const insights = await Insight.find(query).sort({ createdAt: -1 });
    return res.status(200).json(insights);
  } catch (err) {
    console.error('getInsights error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

// GET /ai/chart-suggestions/:datasetId - Get chart suggestions for a dataset
const getChartSuggestions = async (req, res) => {
  try {
    const { datasetId } = req.params;

    const dataset = await Dataset.findById(datasetId).populate('appSpaceId');
    if (!dataset) {
      return res.status(404).json({ error: 'Dataset not found' });
    }

    // Verify user owns the appSpace
    if (dataset.appSpaceId.userId.toString() !== req.user.userId) {
      return res.status(404).json({ error: 'Dataset not found' });
    }

    // Get latest summary insight with chart suggestions
    const insight = await Insight.findOne({
      datasetId,
      type: 'summary',
      chartSuggestions: { $exists: true, $ne: [] },
    }).sort({ createdAt: -1 });

    if (!insight) {
      return res.status(404).json({ error: 'No chart suggestions found. Generate a summary first.' });
    }

    return res.status(200).json(insight.chartSuggestions);
  } catch (err) {
    console.error('getChartSuggestions error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

// POST /ai/generate-chart-suggestions/:datasetId - Generate chart suggestions based on schema analysis
const generateChartSuggestions = async (req, res) => {
  try {
    const { datasetId } = req.params;

    const dataset = await Dataset.findById(datasetId).populate('appSpaceId');
    if (!dataset) {
      return res.status(404).json({ error: 'Dataset not found' });
    }

    // Verify user owns the appSpace
    if (dataset.appSpaceId.userId.toString() !== req.user.userId) {
      return res.status(404).json({ error: 'Dataset not found' });
    }

    const { schema, name: datasetName } = dataset;

    if (!schema || schema.length === 0) {
      return res.status(400).json({ error: 'Dataset has no schema. Please upload data first.' });
    }

    // Categorize fields by type
    const numericFields = schema.filter((f) => ['integer', 'float', 'number'].includes(f.type));
    const categoricalFields = schema.filter((f) => f.type === 'string');
    const dateFields = schema.filter((f) => f.type === 'date');

    const chartSuggestions = [];

    // Helper to capitalize field names for titles
    const toTitle = (field) => field.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

    // 1. Bar Chart: Category vs Numeric
    if (categoricalFields.length > 0 && numericFields.length > 0) {
      const xField = categoricalFields[0].field;
      const yField = numericFields[0].field;
      chartSuggestions.push({
        type: 'bar',
        xField,
        yField,
        title: `${toTitle(yField)} by ${toTitle(xField)}`,
        description: `Compare ${yField} across different ${xField} categories`,
      });
    }

    // 2. Line Chart: Date vs Numeric (time series)
    if (dateFields.length > 0 && numericFields.length > 0) {
      const xField = dateFields[0].field;
      const yField = numericFields[0].field;
      chartSuggestions.push({
        type: 'line',
        xField,
        yField,
        title: `${toTitle(yField)} Over Time`,
        description: `Track ${yField} trends over ${xField}`,
      });
    }

    // 3. Pie Chart: Category distribution (if we have categorical data)
    if (categoricalFields.length > 0) {
      const categoryField = categoricalFields[0].field;
      chartSuggestions.push({
        type: 'pie',
        categoryField,
        title: `Distribution of ${toTitle(categoryField)}`,
        description: `Show the breakdown of records by ${categoryField}`,
      });
    }

    // 4. Scatter Plot: Numeric vs Numeric (if we have 2+ numeric fields)
    if (numericFields.length >= 2) {
      const xField = numericFields[0].field;
      const yField = numericFields[1].field;
      chartSuggestions.push({
        type: 'scatter',
        xField,
        yField,
        title: `${toTitle(xField)} vs ${toTitle(yField)}`,
        description: `Explore correlation between ${xField} and ${yField}`,
      });
    }

    // 5. Area Chart: Date vs Numeric (alternative time series)
    if (dateFields.length > 0 && numericFields.length > 1) {
      const xField = dateFields[0].field;
      const yField = numericFields[1].field;
      chartSuggestions.push({
        type: 'area',
        xField,
        yField,
        title: `${toTitle(yField)} Trend`,
        description: `Visualize ${yField} changes over ${xField}`,
      });
    }

    // Limit to 3 suggestions
    const finalSuggestions = chartSuggestions.slice(0, 3);

    // Save as insight
    const insight = await Insight.create({
      datasetId,
      type: 'summary',
      response: `Generated ${finalSuggestions.length} chart suggestions based on schema analysis.`,
      chartSuggestions: finalSuggestions,
      createdBy: req.user.userId,
    });

    return res.status(201).json({
      datasetId,
      datasetName,
      schemaAnalysis: {
        numericFields: numericFields.map((f) => f.field),
        categoricalFields: categoricalFields.map((f) => f.field),
        dateFields: dateFields.map((f) => f.field),
      },
      chartSuggestions: finalSuggestions,
    });
  } catch (err) {
    console.error('generateChartSuggestions error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export default {
  generateSummary,
  chat,
  getInsights,
  getChartSuggestions,
  generateChartSuggestions,
};
