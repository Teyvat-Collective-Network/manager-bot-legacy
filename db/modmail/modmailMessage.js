import mongoose from 'mongoose';

export default new mongoose.Schema({
  thread: String,
  type: String,
  time: Date,
  author: String,
  origin: String,
  anon: Boolean,
  content: String,
  files: [String],
});
