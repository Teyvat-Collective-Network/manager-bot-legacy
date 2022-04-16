import { ShardClient } from 'detritus-client';
import guilds from '../../guilds';

export default {
  interval: '*/5 * * * *',
  async run(client: ShardClient) {
    const hq = client.guilds.get(guilds.hq.id)!;
    const edit = (id: string, name: string) => {
      const channel = hq.channels.get(id);
      if (channel && channel.name != name) channel.edit({ name });
    }

    const members = hq.members.filter(member => !member.user.bot).length;
    const info = await client.cluster!.tcn.api.info.get();
    if ('error' in info) return;
    const quorum = Math.ceil(info.voters*.6);

    await Promise.all([
      edit(guilds.hq.channels!.members, `Members: ${members}`),
      edit(guilds.hq.channels!.voters, `Max Votes: ${info.voters}`),
      edit(guilds.hq.channels!.quorum, `Quorum: ${quorum}/${info.voters} Votes`),
    ]);
  }
}