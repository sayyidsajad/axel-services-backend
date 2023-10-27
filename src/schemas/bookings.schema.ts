/* eslint-disable prettier/prettier */
import * as mongoose from 'mongoose';

export const BookingSchema = new mongoose.Schema({
    date: { type: String, required: true },
    time: { type: String },
    bookingId: { type: String, required: true },
    user: { type: mongoose.Schema.ObjectId, ref: 'USER_MODEL' },
    service: { type: mongoose.Schema.ObjectId, ref: 'SERVICER_MODEL' },
    approvalStatus: { type: String, default: "Pending", required: true },
    paymentStatus: { type: String, required: true },
    total:{type:Number,required:true}
}, { timestamps: true }); 