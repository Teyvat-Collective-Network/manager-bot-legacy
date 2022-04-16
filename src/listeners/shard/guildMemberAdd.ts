import { GatewayClientEvents, ShardClient } from 'detritus-client';
import { ClientEvents } from 'detritus-client/lib/constants';

import { BaseListener } from '../baseListener';
import { updateRoles } from '../../lib/update';

export default class GuildMemberAddListener extends BaseListener<ShardClient> {
  event = ClientEvents.GUILD_MEMBER_ADD;

  async run({member}: GatewayClientEvents.GuildMemberAdd) {
    updateRoles(member);
  }
}