import { fetchThread } from '../../../lib/modmail.js';

import parent from './index.js';

parent.subcommand({
  name: 'info',
  description: 'Get information about the thread',
}, async interaction => {
  const reply = (content, ephemeral = true) => interaction.reply({ content, ephemeral });

  const { thread, dm } = await fetchThread(interaction);

  if (!thread) return await reply('This is not a modmail thread.');

  if (dm) {
    try {
      const user = await interaction.client.users.fetch(thread.user);
      await reply(`This is a user-to-observer thread with ${user} (${user.tag}).`);
    } catch {
      await reply('This is a user-to-observer thread, but the user does not exist anymore.');
    }
  } else {
    const participants = await interaction.client.db.threadParticipant.find({ thread: thread.uuid });
    const name = id => id === process.env.HQ ? 'the observer team' : interaction.client.guilds.cache.get(id)?.name ?? 'an unknown server';

    await reply(
      `This is a cross-server thread started by ${name(thread.owner)}${
        participants.length > 2
          ? ` with ${participants
              .filter(participant => participant.guild !== thread.owner && participant.guild !== interaction.guild.id)
              .map(participant => name(participant.guild))
              .join(', ')}`
          : ''
      }.`
    );
  }
});
