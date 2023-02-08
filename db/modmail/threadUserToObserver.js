import mongoose from "mongoose";
import threadBase from "./threadBase.js";

export default new mongoose.Schema({
  uuid: String,
  user: String,
  targetChannel: String,
  open: Boolean,
  ...threadBase,
});
