import mongoose from 'mongoose';

export default new mongoose.Schema({
  guild: String,
  template: String,
  instances: [{
    channel: String,
    message: String,
    webhook: String,
    repost: Boolean,
  }],
});