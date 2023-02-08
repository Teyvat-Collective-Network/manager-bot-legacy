import mongoose from 'mongoose';

export default new mongoose.Schema({
  guild: String,
  logChannel: String,
  category: String,
  ping: String,
});
