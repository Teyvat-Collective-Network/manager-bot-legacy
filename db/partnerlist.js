import mongoose from 'mongoose';

export default new mongoose.Schema({
  guild: String,
  template: String,
  instances: [{
    channel: String,
    message: String,
    repost: Boolean,
  }],
});