import mongoose from 'mongoose';

export default new mongoose.Schema({
  uuid: String,
  owner: String,
  name: String,
  open: Boolean,
});
