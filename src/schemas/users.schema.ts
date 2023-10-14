/* eslint-disable prettier/prettier */
import * as mongoose from 'mongoose';

export const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, unique: true, required: true },
  phone: { type: Number, unique: true, required: true },
  password: { type: String, required: true },
  confirmPassword: { type: String, required: true },
  isBlocked: { type: Boolean, default: false, required: true },
});