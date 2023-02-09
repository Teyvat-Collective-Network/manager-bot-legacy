import { SlashCommand } from "@aroleaf/djs-bot";

export default new SlashCommand({
  name: 'close',
  description: 'Close this modmail thread',
  dmPermission: true,
}, async interaction => {
  const reply = content => interaction.reply({ content, ephemeral: true });

  let thread;

  if (interaction.inGuild()) {
    thread = await interaction.client.db.threadUserToObserver.findOne({ targetChannel: interaction.channel.id });
    if (!thread) {
      const participant = await interaction.client.db.threadParticipant.findOne({ channel: interaction.channel.id });
      if (participant) thread = await interaction.client.db.threadInterServer.findOne({ uuid: participant.thread });
    }
  } else {
    thread = await interaction.client.db.threadUserToObserver.findOne({ user: interaction.user.id });
  }

  if (!thread) return await reply(interaction.inGuild() ? 'This is not a modmail thread.' : 'You do not have an open modmail thread.');

  return await reply('TODO...');
})
