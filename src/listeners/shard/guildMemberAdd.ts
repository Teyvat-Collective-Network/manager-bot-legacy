import { GatewayClientEvents, ShardClient } from 'detritus-client';
import { ClientEvents } from 'detritus-client/lib/constants';
import { BaseListener } from '../baseListener';

import guilds from '../../guilds';

export default class GuildMemberAddListener extends BaseListener<ShardClient> {
  event = ClientEvents.GUILD_MEMBER_ADD;

  async run({member, guildId}: GatewayClientEvents.GuildMemberAdd) {
    const guild = Object.entries(guilds).find(([,guild]) => guild.id === guildId)?.[1];
    if (!guild) return;

    const user = member.client.cluster!.tcn.users.get(member.id);
    const roles = [];

    if (member.user.bot) roles.push(guild.roles.bot);

    if (user) {
      if (user.roles & (1<<6)) roles.push(guild.roles.owner);
      if (user.roles & (1<<7)) roles.push(guild.roles.advisor);
      if (user.roles & (1<<8)  && guild.roles.voter) roles.push(guild.roles.voter);

      for (const [g, r] of Object.entries(user.guilds)) {
        const role = guild.roles[g];
        const allowed = !guild.singleColorRole || r & ((1<<6) | (1<<7));
        if (allowed && role) roles.push(role);
      }
    }

    member.edit({ roles });
  }
}