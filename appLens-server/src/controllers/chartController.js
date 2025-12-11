// Chart controller
import fs from 'fs';
import path from 'path';
import Papa from 'papaparse';
import pg from 'pg';
import mysql from 'mysql2/promise';
import { MongoClient } from 'mongodb';
import Dataset from '../models/Dataset.js';

/**
 * Aggregate data from a file (CSV/JSON)
 */
const aggregateFileData = async (filePath, sourceType, xField, yField, groupBy, chartType) => {
  const absolutePath = path.resolve(filePath);
  const fileContent = fs.readFileSync(absolutePath, 'utf-8');
  
  let data;
  if (sourceType === 'csv') {
    const parsed = Papa.parse(fileContent, { header: true, dynamicTyping: true });
    data = parsed.data.filter(row => row[xField] !== undefined && row[xField] !== null);
  } else {
    data = JSON.parse(fileContent);
  }

  // Perform aggregation based on chart type
  return aggregateData(data, xField, yField, groupBy, chartType);
};

/**
 * Aggregate data from PostgreSQL
 */
const aggregatePostgresData = async (connectionDetails, xField, yField, groupBy, chartType, tableName) => {
  const { host, port, database, user, password } = connectionDetails;
  const client = new pg.Client({ host, port: port || 5432, database, user, password });
  
  try {
    await client.connect();
    
    const aggregateFunc = getAggregateFunction(chartType, yField);
    const groupField = groupBy || xField;
    
    const query = `
      SELECT "${groupField}" as label, ${aggregateFunc} as value
      FROM "${tableName}"
      GROUP BY "${groupField}"
      ORDER BY value DESC
      LIMIT 50
    `;
    
    const result = await client.query(query);
    return result.rows.map(row => ({
      label: String(row.label),
      value: Number(row.value) || 0
    }));
  } finally {
    await client.end();
  }
};

/**
 * Aggregate data from MySQL
 */
const aggregateMySQLData = async (connectionDetails, xField, yField, groupBy, chartType, tableName) => {
  const { host, port, database, user, password } = connectionDetails;
  const connection = await mysql.createConnection({ host, port: port || 3306, database, user, password });
  
  try {
    const aggregateFunc = getAggregateFunction(chartType, yField);
    const groupField = groupBy || xField;
    
    const query = `
      SELECT \`${groupField}\` as label, ${aggregateFunc} as value
      FROM \`${tableName}\`
      GROUP BY \`${groupField}\`
      ORDER BY value DESC
      LIMIT 50
    `;
    
    const [rows] = await connection.execute(query);
    return rows.map(row => ({
      label: String(row.label),
      value: Number(row.value) || 0
    }));
  } finally {
    await connection.end();
  }
};

/**
 * Aggregate data from MongoDB
 */
const aggregateMongoDBData = async (connectionDetails, xField, yField, groupBy, chartType, collectionName) => {
  const { host, port, database, user, password } = connectionDetails;
  const authPart = user && password ? `${user}:${password}@` : '';
  const uri = `mongodb://${authPart}${host}:${port || 27017}`;
  const client = new MongoClient(uri);
  
  try {
    await client.connect();
    const db = client.db(database);
    const collection = db.collection(collectionName);
    
    const groupField = groupBy || xField;
    const aggregateOp = getMongoAggregateOp(chartType, yField);
    
    const pipeline = [
      {
        $group: {
          _id: `$${groupField}`,
          value: aggregateOp
        }
      },
      { $sort: { value: -1 } },
      { $limit: 50 },
      {
        $project: {
          _id: 0,
          label: '$_id',
          value: 1
        }
      }
    ];
    
    const result = await collection.aggregate(pipeline).toArray();
    return result.map(row => ({
      label: String(row.label),
      value: Number(row.value) || 0
    }));
  } finally {
    await client.close();
  }
};

/**
 * Get SQL aggregate function based on chart type
 */
const getAggregateFunction = (chartType, yField) => {
  if (chartType === 'pie') {
    return 'COUNT(*) ';
  }
  if (yField) {
    return `SUM("${yField}")`;
  }
  return 'COUNT(*)';
};

/**
 * Get MongoDB aggregate operator based on chart type
 */
const getMongoAggregateOp = (chartType, yField) => {
  if (chartType === 'pie') {
    return { $sum: 1 };
  }
  if (yField) {
    return { $sum: `$${yField}` };
  }
  return { $sum: 1 };
};

/**
 * Aggregate in-memory data (for CSV/JSON files)
 */
const aggregateData = (data, xField, yField, groupBy, chartType) => {
  const groupField = groupBy || xField;
  const aggregated = {};
  
  for (const row of data) {
    const key = String(row[groupField] ?? 'Unknown');
    
    if (!aggregated[key]) {
      aggregated[key] = { count: 0, sum: 0 };
    }
    
    aggregated[key].count += 1;
    if (yField && row[yField] !== undefined) {
      const val = parseFloat(row[yField]);
      if (!isNaN(val)) {
        aggregated[key].sum += val;
      }
    }
  }
  
  // Convert to array format
  const result = Object.entries(aggregated).map(([label, stats]) => ({
    label,
    value: chartType === 'pie' ? stats.count : (yField ? stats.sum : stats.count)
  }));
  
  // Sort by value descending and limit to 50
  return result
    .sort((a, b) => b.value - a.value)
    .slice(0, 50);
};

/**
 * Generate chart data
 * POST /api/charts/generate
 * Body: { datasetId, chartType, xField, yField, groupBy }
 */
const generateChart = async (req, res) => {
  try {
    const { datasetId, chartType, xField, yField, groupBy } = req.body;
    
    // Validate required fields
    if (!datasetId || !chartType || !xField) {
      return res.status(400).json({ 
        error: 'Missing required fields: datasetId, chartType, xField' 
      });
    }
    
    // Validate chart type
    const validChartTypes = ['bar', 'line', 'pie', 'scatter', 'area'];
    if (!validChartTypes.includes(chartType)) {
      return res.status(400).json({ 
        error: `Invalid chartType. Must be one of: ${validChartTypes.join(', ')}` 
      });
    }
    
    // Get dataset
    const dataset = await Dataset.findById(datasetId);
    if (!dataset) {
      return res.status(404).json({ error: 'Dataset not found' });
    }
    
    let chartData;
    const { sourceType, filePath, connectionDetails } = dataset;
    
    // Get table/collection name from connection details or dataset name
    const tableName = connectionDetails?.table || connectionDetails?.collection || dataset.name;
    
    switch (sourceType) {
      case 'csv':
      case 'json':
        if (!filePath) {
          return res.status(400).json({ error: 'File path not found for this dataset' });
        }
        chartData = await aggregateFileData(filePath, sourceType, xField, yField, groupBy, chartType);
        break;
        
      case 'postgresql':
        chartData = await aggregatePostgresData(connectionDetails, xField, yField, groupBy, chartType, tableName);
        break;
        
      case 'mysql':
        chartData = await aggregateMySQLData(connectionDetails, xField, yField, groupBy, chartType, tableName);
        break;
        
      case 'mongodb':
        chartData = await aggregateMongoDBData(connectionDetails, xField, yField, groupBy, chartType, tableName);
        break;
        
      default:
        return res.status(400).json({ error: `Unsupported source type: ${sourceType}` });
    }
    
    // Format response for frontend chart components
    const response = {
      chartType,
      xField,
      yField: yField || 'count',
      groupBy: groupBy || xField,
      labels: chartData.map(d => d.label),
      datasets: [{
        label: yField || 'Count',
        data: chartData.map(d => d.value)
      }],
      // Raw data for custom rendering
      rawData: chartData
    };
    
    res.json(response);
  } catch (err) {
    console.error('Chart generation error:', err);
    res.status(500).json({ error: err.message });
  }
};

export default {
  generateChart
};
