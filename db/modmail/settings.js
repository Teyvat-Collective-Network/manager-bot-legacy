import mongoose from "mongoose";

export default new mongoose.Schema({
  guild: String,
  logChannel: String,
  category: String,
  requestMode: Boolean,
  ping: String,
  reminderDelay: Number,
  reminderInterval: Number,
});
