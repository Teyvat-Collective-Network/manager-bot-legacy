import mongoose from 'mongoose';

import autoRole from './autoRole.js';

export default class Database {
  constructor(uri) {
    this.autoRoles = mongoose.model('AutoRole', autoRole);
    mongoose.connect(uri);
  }
}