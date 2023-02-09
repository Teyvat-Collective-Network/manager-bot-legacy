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

  let guilds = thread.owner === interaction.guild.id ? await interaction.client.tcn.fetchGuilds() : [];
  guilds = guilds.concat({ id: process.env.HQ, name: 'TCN Observer Team' });
  const present = (await interaction.client.db.threadParticipant.find({ thread: thread.uuid })).map(participant => participant.guild);
  guilds = guilds.filter(guild => !present.includes(guild.id));

  if (guilds.length === 0) return await reply('There are no servers that you are eligible to add to this thread that are not already in the thread.');

  await interaction.reply(await serverAddPrompt(interaction, guilds));
});
