import * as mongoose from 'mongoose';

export const MessagingSchema = new mongoose.Schema(
  {
    connectionId: {
      type: String,
      required: true,
    },
    userId: {
      type: mongoose.Schema.ObjectId,
      ref: 'USER_MODEL',
      required: true,
    },
    servicerId: {
      type: mongoose.Schema.ObjectId,
      ref: 'SERVICER_MODEL',
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
  },
  { timestamps: true },
);
