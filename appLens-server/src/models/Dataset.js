import mongoose from 'mongoose';

const datasetSchema = new mongoose.Schema(
  {
    appSpaceId: { type: mongoose.Schema.Types.ObjectId, ref: 'AppSpace', required: true },
    name: { type: String, required: true },
    sourceType: {
      type: String,
      enum: ['csv', 'json', 'xlsx', 'postgresql', 'mysql', 'mongodb'],
      required: true,
    },
    schema: [
      {
        field: { type: String },
        type: { type: String },
        exampleValue: { type: mongoose.Schema.Types.Mixed },
      },
    ],
    recordsCount: { type: Number, default: 0 },
    filePath: { type: String },
    connectionDetails: { type: Object },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

export default mongoose.model('Dataset', datasetSchema);
