import { fetchThread, serverAddPrompt } from '../../../lib/modmail.js';

import parent from './index.js';

parent.subcommand({
  name: 'add',
  description: 'Add more servers to this modmail thread',
}, async interaction => {
  const reply = (content, ephemeral = true) => interaction.reply({ content, ephemeral });

  const { thread, dm } = await fetchThread(interaction);

  if (!thread) return await reply('This is not a modmail thread.');
  if (dm) return await reply('You cannot add servers to a DM-to-observer thread.');
  if (thread.owner !== interaction.guild.id) return await reply('Only the owner server can add servers to the thread.');

  const guilds = await interaction.client.tcn.fetchGuilds();
  const present = (await interaction.client.db.threadParticipant.find({ thread: thread.uuid })).map(participant => participant.guild);

  await interaction.reply(await serverAddPrompt(interaction, guilds.filter(guild => !present.includes(guild.id))));
});
