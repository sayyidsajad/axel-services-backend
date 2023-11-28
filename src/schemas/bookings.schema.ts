import * as mongoose from 'mongoose';

export const BookingSchema = new mongoose.Schema(
  {
    date: { type: String, required: true },
    time: { type: String, required: true },
    bookingId: { type: String, required: true },
    user: { type: mongoose.Schema.ObjectId, ref: 'User' },
    service: { type: mongoose.Schema.ObjectId, ref: 'Servicer' },
    approvalStatus: { type: String, default: 'Pending', required: true },
    paymentStatus: { type: String, required: true },
    total: { type: Number, required: true },
  },
  { timestamps: true },
);
