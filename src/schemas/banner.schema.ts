import * as mongoose from 'mongoose';

export const BannerSchema = new mongoose.Schema(
  {
    bannerName: { type: String, required: true },
    description: { type: String, required: true },
    list: { type: Boolean, default: true, required: true },
    images: [String],
  },
  { timestamps: true },
);
