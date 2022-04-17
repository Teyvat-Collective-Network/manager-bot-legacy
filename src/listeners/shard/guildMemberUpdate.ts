import { GatewayClientEvents, ShardClient } from 'detritus-client';
import { ClientEvents } from 'detritus-client/lib/constants';

import { BaseListener } from '../baseListener';
import { updateRoles } from '../../lib/update';

export default class GuildMemberAddListener extends BaseListener<ShardClient> {
  event = ClientEvents.GUILD_MEMBER_UPDATE;

  async run({member, differences}: GatewayClientEvents.GuildMemberUpdate) {
    if (differences?.roles) updateRoles(member);
  }
}