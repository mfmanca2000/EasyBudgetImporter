import mongoose from 'mongoose';

// Define the schema for the Income collection
const IncomeSchema = new mongoose.Schema({
  _id: { type: Number },
  Date: { type: String, required: true, match: /^\d{4}-\d{2}-\d{2}$/ },
  Description: { type: String, required: true },
  Amount: { type: Number, required: true },
  MicroCategory: { 
    type: Number, 
    ref: 'MicroCategory',
    required: true 
  },
  Recurrent: { type: Number, default: 0 },
}, {
  collection: 'Incomes',
  versionKey: false
});

// Create or retrieve model
export const Income = mongoose.models.Income ||
  mongoose.model('Income', IncomeSchema);