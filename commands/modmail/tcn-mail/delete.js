import parent from './index.js';

parent.subcommand({
  name: 'delete',
  description: 'Delete a modmail channel that is no longer in use',
}, async interaction => {
  const reply = (content, ephemeral = true) => interaction.reply({ content, ephemeral });

  if (!await interaction.client.db.abandonedThread.exists({ channel: interaction.channel.id }))
    return await reply('This is either not a modmail thread or it is still in use.');

  await interaction.channel.delete(`Modmail thread deleted by ${interaction.user.tag} / ${interaction.user.id}.`);
});
