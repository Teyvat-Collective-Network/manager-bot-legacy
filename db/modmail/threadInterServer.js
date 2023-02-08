import mongoose from 'mongoose';
import threadBase from './threadBase.js';

export default new mongoose.Schema({
  uuid: String,
  guilds: [String],
  targetChannels: [String],
  escalated: Boolean,
  observerChannel: String,
  open: Boolean,
  ...threadBase,
});
