import mongoose from 'mongoose';

const chartConfigSchema = new mongoose.Schema({
  dataset: { type: mongoose.Schema.Types.ObjectId, ref: 'Dataset' },
  config: { type: Object, required: true },
});

export default mongoose.model('ChartConfig', chartConfigSchema);
