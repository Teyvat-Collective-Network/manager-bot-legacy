import mongoose from 'mongoose';

export default new mongoose.Schema({
  uuid: String,
  user: String,
  targetChannel: String,
  open: Boolean,
});
