import mongoose from 'mongoose';

export default new mongoose.Schema({
  type: Number,
  guild: String,
  discord: String,
  api: String,
});