import { fetchThread } from '../../../lib/modmail.js';

import parent from './index.js';

parent.subcommand({
  name: 'leave',
  description: 'Disconnect this channel from its thread',
}, async interaction => {
  const reply = (content, ephemeral = true) => interaction.reply({ content, ephemeral });

  const { thread, dm } = await fetchThread(interaction);

  if (!thread) return await reply('This is not a modmail thread.');
  if (dm) return await reply('You cannot leave user-to-observer threads.');
  if (thread.owner === interaction.guild.id) return await reply('The owner server cannot leave the thread.');

  await interaction.client.db.threadParticipant.findOneAndDelete({ thread: thread.uuid, guild: interaction.guild.id });
  await interaction.client.db.abandonedThread.create({ channel: interaction.channel.id });
  await reply('This channel is no longer connected to the modmail thread. Use **/tcn-mail delete** to delete it.');

  for (const participant of await interaction.client.db.threadParticipant.find({ thread: thread.uuid })) {
    await interaction.client.channels.cache.get(participant.channel)?.send({
      embeds: [{
        title: 'Server Disconnected',
        description: `${interaction.guild.name} left the modmail thread.`,
        color: 0x2d3136
      }],
    }).catch(() => {});
  }

  await interaction.client.db.modmailMessages.create({
    thread: thread.uuid,
    type: 'cross-server-disconnect',
    time: new Date(),
    author: interaction.user.id,
    origin: interaction.guild.id,
  });
});
