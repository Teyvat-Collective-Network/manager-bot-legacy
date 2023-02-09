import mongoose from 'mongoose';

export default new mongoose.Schema({
  thread: String,
  guild: String,
  sendAll: Boolean,
  subscribers: [String],
  silenced: Number,
});
