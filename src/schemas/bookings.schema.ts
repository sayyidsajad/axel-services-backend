/* eslint-disable prettier/prettier */
import * as mongoose from 'mongoose';

export const BookingSchema = new mongoose.Schema({
    service: { type: mongoose.Schema.ObjectId, ref: 'SERVICER_MODEL' },
    user: { type: mongoose.Schema.ObjectId, ref: 'USER_MODEL' },
    approved: { type: Boolean, default: false, required: true }
}); 