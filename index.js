import { Bot, util } from '@aroleaf/djs-bot';
import TCN from '@aroleaf/tcn-api';
import 'dotenv/config';

import Database from './db/index.js';
import { getBanshareCommands } from './lib/banshare-compat.js';

const ownCommands = await util.loader('commands');
const banshareCommands = await getBanshareCommands();

const client = new Bot({
  intents: [1<<0, 1<<1, 1<<9],
  commands: ownCommands.concat(banshareCommands),
  events: await util.loader('events'),
  owner: '659488296820408355',
  register: {
    global: !!process.env.PRODUCTION,
    guilds: [
      '804174916907171870',
      '878812623725002752',
      '838473416310652998',
    ],
  },
});

client.tcn = new TCN(process.env.API_URL, process.env.API_TOKEN);
client.db = new Database(process.env.DATABASE_URI);

client.login(process.env.DISCORD_TOKEN);