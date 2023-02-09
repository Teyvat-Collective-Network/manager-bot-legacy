import mongoose from 'mongoose';

import autoRole from './autoRole.js';

import abandonedThread from './modmail/abandonedThread.js';
import bannedUsers from './modmail/bannedUsers.js';
import modmailMessage from './modmail/modmailMessage.js';
import modmailSettings from './modmail/modmailSettings.js';
import threadInterServer from './modmail/threadInterServer.js';
import threadParticipant from './modmail/threadParticipant.js';
import threadUserToObserver from './modmail/threadUserToObserver.js';

export default class Database {
  constructor(uri) {
    this.autoRoles = mongoose.model('AutoRole', autoRole);

    this.abandonedThread = mongoose.model('AbandonedThread', abandonedThread);
    this.bannedUsers = mongoose.model('BannedUsers', bannedUsers);
    this.modmailMessage = mongoose.model('ModmailMessage', modmailMessage);
    this.modmailSettings = mongoose.model('ModmailSettings', modmailSettings);
    this.threadInterServer = mongoose.model('ThreadInterServer', threadInterServer);
    this.threadParticipant = mongoose.model('ThreadParticipant', threadParticipant);
    this.threadUserToObserver = mongoose.model('ThreadUserToObserver', threadUserToObserver);

    mongoose.connect(uri);
  }
}
