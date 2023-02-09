import mongoose from 'mongoose';

export default new mongoose.Schema({
  thread: String,
  guild: String,
  channel: String,
  connected: Boolean,
  subscribers: [String],
  silenced: Number,
});
