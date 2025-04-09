import mongoose from 'mongoose';

// Define the schema for the Counter collection
const CounterSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  seq: { type: Number, default: 0 }
}, {
  collection: 'Counters'
});

// Create or retrieve model
export const Counter = mongoose.models.Counter ||
  mongoose.model('Counter', CounterSchema);