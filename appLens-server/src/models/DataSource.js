import mongoose from 'mongoose';

const dataSourceSchema = new mongoose.Schema({
  type: { type: String, required: true },
  config: { type: Object, required: true },
});

export default mongoose.model('DataSource', dataSourceSchema);
