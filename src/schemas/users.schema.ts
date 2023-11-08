import * as mongoose from 'mongoose';

export const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, unique: true, required: true },
    phone: { type: Number, unique: true, required: true },
    password: { type: String, required: true },
    isBlocked: { type: Boolean, default: false, required: true },
    isVerified: { type: Boolean, default: false, required: true },
    inbox: {
      type: Array,
      cancelReason: { type: String },
      bookingId: { types: mongoose.Schema.ObjectId, ref: 'BOOKING_MODEL' },
    },
    wallet: {
      type: Number,
      default: 0,
    },
    address: [
      {
        name: {
          type: String,
        },
        housename: {
          type: String,
        },
        city: {
          type: String,
        },
        state: {
          type: String,
        },
        phone: {
          type: Number,
        },
        pincode: {
          type: Number,
        },
      },
    ],
    walletHistory: [
      {
        date: {
          type: Date,
        },
        amount: {
          type: Number,
        },
        description: {
          type: String,
        },
      },
    ],
  },
  { timestamps: true },
);
