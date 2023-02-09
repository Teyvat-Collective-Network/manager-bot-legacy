import mongoose from 'mongoose';

export default new mongoose.Schema({
  uuid: String,
  escalated: Boolean,
  observerChannel: String,
  open: Boolean,
});
