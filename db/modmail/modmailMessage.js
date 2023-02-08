import mongoose from "mongoose";

export default new mongoose.Schema({
  thread: String,
  type: String,
  author: String,
  anon: Boolean,
  content: String,
  files: [String],
});
