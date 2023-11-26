import * as mongoose from 'mongoose';

export const AdditionalServicesSchema = new mongoose.Schema({
  servicerId: { type: mongoose.Schema.ObjectId, ref: 'Servicer' },
  service: { type: String, required: true },
  description: { type: String, required: true },
  amount: { type: Number, required: true },
  image: { type: String, required: true },
  list: { type: Boolean, required: true, default: true },
});
