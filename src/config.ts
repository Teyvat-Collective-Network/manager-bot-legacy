import { GatewayIntents } from 'detritus-client-socket/lib/constants';
import { BotOptions } from './bot';

export const config: BotOptions = {
  commands: './commands',
  gateway: {
    shardCount: 1,
    loadAllMembers: true,
    intents: [
      GatewayIntents.GUILDS,
      GatewayIntents.GUILD_MESSAGES,
      GatewayIntents.GUILD_MEMBERS,
    ],
  }
}

export { config as default };