import { Bot, Partials, util } from '@aroleaf/djs-bot';
import TCN from '@aroleaf/tcn-api';
import 'dotenv/config';

import Database from './db/index.js';
import { getBanshareCommands } from './lib/banshare-compat.js';

const ownCommands = await util.loader('commands');
const banshareCommands = await getBanshareCommands();

const client = new Bot({
  intents: [1<<0, 1<<1, 1<<9, 1<<12, 1<<15],
  partials: [Partials.Channel],
  commands: ownCommands.concat(banshareCommands),
  events: await util.loader('events'),
  owner: '659488296820408355',
  register: {
    global: !!process.env.PRODUCTION,
    guilds: [
      // TODO revert this
      // '804174916907171870',
      // '878812623725002752',
      // '838473416310652998',
      '927153548339343360',
    ],
  },
});

client.tcn = new TCN(process.env.API_URL, process.env.API_TOKEN);
client.db = new Database(process.env.DATABASE_URI);

client.login(process.env.DISCORD_TOKEN);