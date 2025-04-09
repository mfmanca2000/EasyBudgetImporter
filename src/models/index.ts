import mongoose from 'mongoose';
import { Counter } from './counter';
import { Income } from './income';

// Define the schema for the MacroCategory collection
const MacroCategorySchema = new mongoose.Schema({
  _id: { type: Number },
  Name: { type: String, required: true },
}, { 
  collection: 'MacroCategories',
  versionKey: false
});

// Define the schema for the MicroCategory collection
const MicroCategorySchema = new mongoose.Schema({
  _id: { type: Number },
  Name: { type: String, required: true },
  MacroID: { 
    type: Number, 
    ref: 'MacroCategory',
    required: true 
  },
}, {
  collection: 'MicroCategories',
  versionKey: false
});

// Define the schema for the Expense collection
const ExpenseSchema = new mongoose.Schema({
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
  collection: 'Expenses',
  versionKey: false
});

// Create or retrieve models
export const MacroCategory = mongoose.models.MacroCategory || 
  mongoose.model('MacroCategory', MacroCategorySchema);

export const MicroCategory = mongoose.models.MicroCategory || 
  mongoose.model('MicroCategory', MicroCategorySchema);

export const Expense = mongoose.models.Expense || 
  mongoose.model('Expense', ExpenseSchema);

// Re-export the Counter and Income models
export { Counter, Income };
