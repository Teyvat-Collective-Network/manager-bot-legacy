import { Bot, util } from '@aroleaf/djs-bot';
import { Client as TCN } from '@aroleaf/tcn-api';
import { PartnerLists } from './lib/index.js';
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
  prefix: 'tcn.',
  register: {
    global: !!process.env.PRODUCTION,
    guilds: [
      '1081241975363223643',
      '1081241922372382770',
      '1074629732521488434',
      '1074629783440326679',
    ],
  },
});

client.tcn = new TCN(process.env.API_URL, process.env.API_TOKEN);
client.db = new Database(process.env.DATABASE_URI);
client.partnerlists = new PartnerLists(client);

client.login(process.env.DISCORD_TOKEN);