import mongoose from 'mongoose';

import autoRole from './autoRole.js';
import partnerlist from './partnerlist.js';

export default class Database {
  constructor(uri) {
    this.autoRoles = mongoose.model('AutoRole', autoRole);
    this.partnerlists = mongoose.model('Partnerlist', partnerlist);
    mongoose.connect(uri);
  }
}