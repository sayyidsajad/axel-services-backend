/* eslint-disable prettier/prettier */
import * as mongoose from 'mongoose';

export const CategorySchema = new mongoose.Schema({
    categoryName: { type: String, required: true },
    description: { type: String, required: true },
    list: { type: Boolean, default: true, required: true }
});