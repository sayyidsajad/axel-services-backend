import * as mongoose from 'mongoose';

export const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, unique: true, required: true },
    phone: { type: Number, unique: true, required: true },
    password: { type: String, required: true },
    isBlocked: { type: Boolean, default: false, required: true },
    isVerified: { type: Boolean, default: false, required: true },
    googleAuth: { type: Boolean, default: false, required: true },
    image: String,
    inbox: [
      {
        cancelReason: { type: String },
        bookingId: { type: mongoose.Schema.ObjectId, ref: 'Booking' },
      },
    ],
    wallet: {
      type: Number,
      default: 0,
    },
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
