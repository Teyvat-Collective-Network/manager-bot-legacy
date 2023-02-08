import { ApplicationCommandOptionType, ChannelType, PermissionFlagsBits } from "@aroleaf/djs-bot";
import parent from './index.js';

parent.subcommand({
  name: 'log-channel',
  description: 'Set the modmail log channel (or remove it to disable modmail)',
  options: [{
    type: ApplicationCommandOptionType.Channel,
    name: 'channel',
    description: 'The channel to set',
    channelTypes: [ChannelType.GuildText],
  }]
}, async interaction => {
  const reply = content => interaction.reply({ content, ephemeral: true });

  const channel = interaction.options.getChannel('channel');

  if (channel &&
    !channel.permissionsFor(interaction.guild.members.me).has(PermissionFlagsBits.ViewChannel
      | PermissionFlagsBits.SendMessages
      | PermissionFlagsBits.EmbedLinks)) {
    return await reply('The bot must have View Channel, Send Messages, and Embed Links in the log channel.');
  }

  const old = await interaction.client.db.modmailSettings.findOneAndUpdate(
    { guild: interaction.guild.id },
    { $set: { logChannel: channel?.id } },
    { upsert: true }
  );

  let message = channel
    ? `The modmail log channel has been set to ${channel}.`
    : 'The modmail log channel has been removed and modmail has been disabled.';

  if (channel && !old?.category)
    message +=
      ' The category is not set (use **/tcn-mail category** to set it) and has been updated to its parent channel.)'

  await reply(message);
});