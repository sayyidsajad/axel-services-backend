import * as mongoose from 'mongoose';

export const BannerSchema = new mongoose.Schema(
  {
    bannerName: { type: String, required: true },
    description: { type: String, required: true },
    image: { type: String, required: true },
  },
  { timestamps: true },
);
