import mongoose from 'mongoose';

const insightSchema = new mongoose.Schema(
  {
    datasetId: { type: mongoose.Schema.Types.ObjectId, ref: 'Dataset', required: true },
    appSpaceId: { type: mongoose.Schema.Types.ObjectId, ref: 'AppSpace', required: true },
    summary: { type: String, required: true },
    type: {
      type: String,
      enum: ['summary', 'chat'],
      required: true,
    },
    prompt: { type: String },
    // Renamed from 'response' to 'chatResponse' for clarity
    chatResponse: { type: String },
    // NEW FIELD: Store the structured JSON from Gemini summary here
    structuredData: { 
      type: mongoose.Schema.Types.Mixed,
      // Example structure for 'summary' type: { insights: [], trendSummaries: [] }
    },
    chartSuggestions: [
      {
        chartType: { type: String },
        xAxis: { type: String },
        yAxis: { type: String },
        title: { type: String },
      },
    ],
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

export default mongoose.model('Insight', insightSchema);
