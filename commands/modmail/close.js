import { SlashCommand } from "@aroleaf/djs-bot";

export default new SlashCommand({
  name: 'close',
  description: 'Close your modmail thread',
  defaultMemberPermissions: "0",
}, async interaction => {
  const reply = (content, ephemeral = true) => interaction.reply({ content, ephemeral });

  if (interaction.inGuild()) return await reply('This command is for users to close their thread from DMs. Please use **/tcn-mail close**.');

  const thread = await interaction.client.db.threadUserToObserver.findOne({ user: interaction.user.id, open: true });

  if (!thread) return await reply('You do not have an open modmail thread.');

  await interaction.client.db.threadUserToObserver.findOneAndUpdate({ uuid: thread.uuid }, { $set: { open: false } });

  await reply(
    `Your modmail thread is now closed. We hope we were able to help you. If you have any further inquiries, please open another modmail thread by simply sending another message. A transcript is available at ${process.env.MODMAIL_DOMAIN}/transcript/${thread.uuid}.`,
    false
  );
  
  await interaction.client.channels.cache.get(thread.targetChannel).send({
    embeds: [{
      title: 'Modmail Thread Closed',
      description: 'This modmail thread was closed by the user.',
      color: 0x2d3136,
    }],
  }).catch(() => {});
});
