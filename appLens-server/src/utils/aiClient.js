// AI Client utility for Google Gemini integration
import { GoogleGenerativeAI, SchemaType } from '@google/generative-ai';

/**
 * Get the GoogleGenerativeAI instance (lazy initialized)
 */
const getGenAI = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }
  return new GoogleGenerativeAI();
};

/**
 * Check if API key is available
 */
const hasApiKey = () => !!process.env.GEMINI_API_KEY;

/**
 * Generate mock AI summary trends when no API key is available
 * @returns {string[]} Array of trend summary strings
 */
const getMockTrendSummaries = () => [
  "Revenue increased 43% on Tuesday due to campaign spikes.",
  "Conversion rate steady at 5.7%.",
  "Top-selling region: Maharashtra."
];

/**
 * @param {Function} apiCall - Async function that makes the API call
 * @param {number} maxRetries - Maximum number of retry attempts (default: 4)
 * @returns {Promise<any>} - Result of the API call
 */
const executeWithRetry = async (apiCall, maxRetries = 4) => {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await apiCall();
    } catch (error) {
      // Check if it's a rate limit error (429)
      const isRateLimitError = 
        error?.status === 429 || 
        error?.message?.includes('429') ||
        error?.message?.toLowerCase().includes('rate limit') ||
        error?.message?.toLowerCase().includes('quota');

      if (isRateLimitError && attempt < maxRetries - 1) {
        // Calculate exponential backoff with jitter
        const baseDelay = Math.pow(2, attempt) * 1000; // 1s, 2s, 4s, 8s
        const jitter = Math.floor(Math.random() * 1000); // 0-1000ms random jitter
        const waitTime = baseDelay + jitter;

        console.warn(`Rate limit hit (attempt ${attempt + 1}/${maxRetries}). Retrying in ${waitTime}ms...`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
        continue;
      }

      // If not a rate limit error or max retries reached, throw the error
      throw error;
    }
  }
};

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
 * Generate a summary insight for a dataset using Google Gemini
 * @param {Object} params - Parameters for the summary
 * @param {string} params.datasetName - Name of the dataset
 * @param {Array} params.schema - Schema of the dataset
 * @param {number} params.recordsCount - Number of records
 * @param {Array} params.sampleData - Sample data rows (first 50)
 * @returns {Promise<{ summary: string, insights: Array, trendSummaries: Array, chartSuggestions: Array }>}
 */
export const generateDatasetSummary = async ({ datasetName, schema, recordsCount, sampleData }) => {
  // Use mock response if no API key available
  if (!hasApiKey()) {
    console.log('No GEMINI_API_KEY found, using mock response');
    return generateMockSummary({ datasetName, schema, recordsCount });
  }

  const genAI = getGenAI();

  const prompt = `
You are a data analyst. Analyze the following dataset and provide:
1. A brief summary of what this data represents
2. 3 key insights about the data
3. 3 trend summaries with title, description, and trend (positive/negative/neutral)
4. Suggested chart types with their configurations

Dataset Name: ${datasetName}
Total Records: ${recordsCount}

Schema:
${schema.map((s) => `- ${s.field} (${s.type}): example "${s.exampleValue}"`).join('\n')}

Sample Data (first rows):
${JSON.stringify(sampleData.slice(0, 10), null, 2)}

Respond in the exact JSON format specified in the schema.
`;

  try {
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.0-flash-exp',
      generationConfig: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: SchemaType.OBJECT,
          properties: {
            summary: {
              type: SchemaType.STRING,
              description: 'Brief description of the dataset',
            },
            insights: {
              type: SchemaType.ARRAY,
              items: {
                type: SchemaType.STRING,
              },
              description: 'Array of 3 key insights',
            },
            trendSummaries: {
              type: SchemaType.ARRAY,
              items: {
                type: SchemaType.OBJECT,
                properties: {
                  title: { type: SchemaType.STRING },
                  description: { type: SchemaType.STRING },
                  trend: { 
                    type: SchemaType.STRING,
                    enum: ['positive', 'negative', 'neutral'],
                  },
                },
                required: ['title', 'description', 'trend'],
              },
              description: 'Array of 3 trend summaries',
            },
            chartSuggestions: {
              type: SchemaType.ARRAY,
              items: {
                type: SchemaType.OBJECT,
                properties: {
                  chartType: { 
                    type: SchemaType.STRING,
                    enum: ['bar', 'line', 'pie', 'scatter', 'area'],
                  },
                  xAxis: { type: SchemaType.STRING },
                  yAxis: { type: SchemaType.STRING },
                  title: { type: SchemaType.STRING },
                },
                required: ['chartType', 'xAxis', 'yAxis', 'title'],
              },
              description: 'Array of chart suggestions',
            },
          },
          required: ['summary', 'insights', 'trendSummaries', 'chartSuggestions'],
        },
      },
    });

    const result = await executeWithRetry(async () => {
      const response = await model.generateContent(prompt);
      return JSON.parse(response.response.text());
    });

    return result;
  } catch (err) {
    console.error('Gemini API error, falling back to mock:', err.message);
    return generateMockSummary({ datasetName, schema, recordsCount });
  }
};

/**
 * Chat with AI about a dataset using Google Gemini
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
  if (!hasApiKey()) {
    console.log('No GEMINI_API_KEY found, using mock chat response');
    return `I'm analyzing the "${datasetName}" dataset with ${schema.length} fields. Based on your question "${question}", I would need the Gemini API key to provide a detailed analysis. Please configure GEMINI_API_KEY in your .env file for full AI capabilities.`;
  }

  const genAI = getGenAI();

  const systemPrompt = `
You are a helpful data analyst assistant. You have access to a dataset called "${datasetName}".

Schema:
${schema.map((s) => `- ${s.field} (${s.type})`).join('\n')}

Sample Data:
${JSON.stringify(sampleData.slice(0, 5), null, 2)}

Answer the user's questions about this dataset. Be concise and helpful.
`;

  try {
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-2.0-flash-exp',
      systemInstruction: systemPrompt, // Use dedicated systemInstruction config
    });

    const result = await executeWithRetry(async () => {
      // Prepare history for chat (ONLY user/model turns go here)
      const history = chatHistory.map((msg) => ({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.content }],
      }));

      // Start a chat session with history
      const chat = model.startChat({
        history: history,
      });

      // Send the current question
      const response = await chat.sendMessage(question);
      return response.response.text();
    });

    return result;
  } catch (err) {
    console.error('Gemini API error:', err.message);
    return `Unable to process your question due to an API error. Please try again later.`;
  }
};

/**
 * Generate AI summary from dataset data using Google Gemini
 * Returns an array of 3 trend summary strings
 * @param {Array} data - Array of data rows to analyze
 * @returns {Promise<string[]>} - Array of trend summary strings
 */
export const generateAISummary = async (data) => {
  // Return mock data if no API key available
  if (!hasApiKey()) {
    console.log('No GEMINI_API_KEY found, using mock trend summaries');
    return getMockTrendSummaries();
  }

  // If no data provided, return mock
  if (!data || data.length === 0) {
    return getMockTrendSummaries();
  }

  const genAI = getGenAI();

  const prompt = `
You are a data analyst. Analyze the following dataset and provide exactly 3 trend summary statements.
Each statement should be a single sentence describing a key trend, insight, or observation from the data.

Data (sample rows):
${JSON.stringify(data.slice(0, 20), null, 2)}

Respond in the exact JSON format specified in the schema.
`;

  try {
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.0-flash-exp',
      generationConfig: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: SchemaType.OBJECT,
          properties: {
            trends: {
              type: SchemaType.ARRAY,
              items: {
                type: SchemaType.STRING,
              },
              description: 'Array of exactly 3 trend summary statements',
            },
          },
          required: ['trends'],
        },
      },
    });

    const result = await executeWithRetry(async () => {
      const response = await model.generateContent(prompt);
      const parsed = JSON.parse(response.response.text());
      return parsed.trends || getMockTrendSummaries();
    });

    return result;
  } catch (err) {
    console.error('Gemini API error, falling back to mock:', err.message);
    return getMockTrendSummaries();
  }
};

export default {
  generateAISummary,
  generateDatasetSummary,
  chatAboutDataset,
};
