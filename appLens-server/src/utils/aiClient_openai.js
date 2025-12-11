// AI Client utility for OpenAI/Gemini integration
import OpenAI from 'openai';

const hasApiKey = !!process.env.OPENAI_API_KEY;

/**
 * Generate mock AI summary trends when no API key is available
 * @returns {string[]} Array of trend summary strings
 */
const getMockTrendSummaries = () => [
  "Revenue increased 43% on Tuesday due to campaign spikes.",
  "Conversion rate steady at 5.7%.",
  "Top-selling region: Maharashtra."
];

let openai = null;
if (hasApiKey) {
  openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
}

/**
 * Generate mock AI response for testing without API key
 */
const generateMockSummary = ({ datasetName, schema, recordsCount }) => {
  const numericFields = schema.filter((f) => ['integer', 'float', 'number'].includes(f.type));
  const categoricalFields = schema.filter((f) => f.type === 'string');
  const dateFields = schema.filter((f) => f.type === 'date');

  return {
    summary: `This dataset "${datasetName}" contains ${recordsCount} records with ${schema.length} fields.`,
    insights: [
      `The dataset has ${numericFields.length} numeric field(s) suitable for aggregation and calculations.`,
      `There are ${categoricalFields.length} categorical field(s) that can be used for grouping and filtering.`,
      dateFields.length > 0
        ? `Date field(s) detected: ${dateFields.map((f) => f.field).join(', ')} - suitable for time series analysis.`
        : `No date fields detected. Consider adding timestamps for trend analysis.`,
    ],
    trendSummaries: [
      {
        title: 'Data Distribution',
        description: `The dataset contains ${recordsCount} records across ${schema.length} columns.`,
        trend: 'neutral',
      },
      {
        title: 'Numeric Analysis',
        description: numericFields.length > 0
          ? `Fields like ${numericFields[0]?.field || 'numeric columns'} can be analyzed for patterns.`
          : 'No numeric fields available for quantitative analysis.',
        trend: numericFields.length > 0 ? 'positive' : 'neutral',
      },
      {
        title: 'Categorization',
        description: categoricalFields.length > 0
          ? `Group data by ${categoricalFields[0]?.field || 'categories'} for segmentation insights.`
          : 'Limited categorical data available.',
        trend: categoricalFields.length > 0 ? 'positive' : 'neutral',
      },
    ],
    chartSuggestions: [
      numericFields.length > 0 && categoricalFields.length > 0
        ? { chartType: 'bar', xAxis: categoricalFields[0].field, yAxis: numericFields[0].field, title: `${numericFields[0].field} by ${categoricalFields[0].field}` }
        : null,
      dateFields.length > 0 && numericFields.length > 0
        ? { chartType: 'line', xAxis: dateFields[0].field, yAxis: numericFields[0].field, title: `${numericFields[0].field} Over Time` }
        : null,
      categoricalFields.length > 0
        ? { chartType: 'pie', xAxis: categoricalFields[0].field, yAxis: 'count', title: `Distribution of ${categoricalFields[0].field}` }
        : null,
    ].filter(Boolean),
  };
};

/**
 * Generate a summary insight for a dataset
 * @param {Object} params - Parameters for the summary
 * @param {string} params.datasetName - Name of the dataset
 * @param {Array} params.schema - Schema of the dataset
 * @param {number} params.recordsCount - Number of records
 * @param {Array} params.sampleData - Sample data rows (first 50)
 * @returns {Promise<{ summary: string, insights: Array, trendSummaries: Array, chartSuggestions: Array }>}
 */
export const generateDatasetSummary = async ({ datasetName, schema, recordsCount, sampleData }) => {
  // Use mock response if no API key available
  if (!hasApiKey || !openai) {
    console.log('No OPENAI_API_KEY found, using mock response');
    return generateMockSummary({ datasetName, schema, recordsCount });
  }

  const prompt = `
You are a data analyst. Analyze the following dataset and provide:
1. A brief summary of what this data represents
2. 3 key insights about the data
3. 3 trend summaries in JSON format with title, description, and trend (positive/negative/neutral)
4. Suggested chart types with their configurations

Dataset Name: ${datasetName}
Total Records: ${recordsCount}

Schema:
${schema.map((s) => `- ${s.field} (${s.type}): example "${s.exampleValue}"`).join('\n')}

Sample Data (first rows):
${JSON.stringify(sampleData.slice(0, 10), null, 2)}

Respond in JSON format:
{
  "summary": "Brief description of the dataset",
  "insights": ["insight 1", "insight 2", "insight 3"],
  "trendSummaries": [
    { "title": "Trend title", "description": "Description of the trend", "trend": "positive|negative|neutral" }
  ],
  "chartSuggestions": [
    { "chartType": "bar|line|pie|scatter", "xAxis": "field_name", "yAxis": "field_name", "title": "Chart title" }
  ]
}
`;

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' },
    });

    const result = JSON.parse(response.choices[0].message.content);
    return result;
  } catch (err) {
    console.error('OpenAI API error, falling back to mock:', err.message);
    return generateMockSummary({ datasetName, schema, recordsCount });
  }
};

/**
 * Chat with AI about a dataset
 * @param {Object} params - Parameters for the chat
 * @param {string} params.question - User's question
 * @param {string} params.datasetName - Name of the dataset
 * @param {Array} params.schema - Schema of the dataset
 * @param {Array} params.sampleData - Sample data rows
 * @param {Array} params.chatHistory - Previous chat messages
 * @returns {Promise<string>} - AI response
 */
export const chatAboutDataset = async ({ question, datasetName, schema, sampleData, chatHistory = [] }) => {
  // Use mock response if no API key available
  if (!hasApiKey || !openai) {
    console.log('No OPENAI_API_KEY found, using mock chat response');
    return `I'm analyzing the "${datasetName}" dataset with ${schema.length} fields. Based on your question "${question}", I would need the OpenAI API key to provide a detailed analysis. Please configure OPENAI_API_KEY in your .env file for full AI capabilities.`;
  }

  const systemPrompt = `
You are a helpful data analyst assistant. You have access to a dataset called "${datasetName}".

Schema:
${schema.map((s) => `- ${s.field} (${s.type})`).join('\n')}

Sample Data:
${JSON.stringify(sampleData.slice(0, 5), null, 2)}

Answer the user's questions about this dataset. Be concise and helpful.
`;

  const messages = [
    { role: 'system', content: systemPrompt },
    ...chatHistory.map((msg) => ({
      role: msg.role,
      content: msg.content,
    })),
    { role: 'user', content: question },
  ];

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages,
    });

    return response.choices[0].message.content;
  } catch (err) {
    console.error('OpenAI API error:', err.message);
    return `Unable to process your question due to an API error. Please try again later.`;
  }
};

/**
 * Generate AI summary from dataset data
 * Returns an array of 3 trend summary strings
 * @param {Array} data - Array of data rows to analyze
 * @returns {Promise<string[]>} - Array of trend summary strings
 */
export const generateAISummary = async (data) => {
  // Return mock data if no API key available
  if (!hasApiKey || !openai) {
    console.log('No OPENAI_API_KEY found, using mock trend summaries');
    return getMockTrendSummaries();
  }

  // If no data provided, return mock
  if (!data || data.length === 0) {
    return getMockTrendSummaries();
  }

  const prompt = `
You are a data analyst. Analyze the following dataset and provide exactly 3 trend summary statements.
Each statement should be a single sentence describing a key trend, insight, or observation from the data.

Data (sample rows):
${JSON.stringify(data.slice(0, 20), null, 2)}

Respond in JSON format:
{
  "trends": [
    "First trend statement",
    "Second trend statement", 
    "Third trend statement"
  ]
}
`;

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' },
    });

    const result = JSON.parse(response.choices[0].message.content);
    return result.trends || getMockTrendSummaries();
  } catch (err) {
    console.error('OpenAI API error, falling back to mock:', err.message);
    return getMockTrendSummaries();
  }
};

export default {
  generateAISummary,
  generateDatasetSummary,
  chatAboutDataset,
};
