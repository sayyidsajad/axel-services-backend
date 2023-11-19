import * as mongoose from 'mongoose';

export const ReviewSchema = new mongoose.Schema(
  {
    servicer: { type: mongoose.Schema.Types.ObjectId, ref: 'SERVICER_MODEL' },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'USER_MODEL' },
    review: { type: String, required: true },
  },
  { timestamps: true },
);
