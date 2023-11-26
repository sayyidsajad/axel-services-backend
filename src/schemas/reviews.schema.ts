import * as mongoose from 'mongoose';

export const ReviewSchema = new mongoose.Schema(
  {
    servicer: { type: mongoose.Schema.Types.ObjectId, ref: 'Servicer' },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    review: { type: String, required: true },
  },
  { timestamps: true },
);
