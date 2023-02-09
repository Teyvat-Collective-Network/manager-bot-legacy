import { ApplicationCommandOptionType, ChannelType, escapeInlineCode, PermissionFlagsBits } from '@aroleaf/djs-bot';
import parent from './index.js';

parent.subcommand({
  name: 'category',
  description: 'Set the modmail category (new threads are opened here with the same permissions as the category)',
  options: [{
    type: ApplicationCommandOptionType.Channel,
    name: 'category',
    description: 'The category to set',
    channelTypes: [ChannelType.GuildCategory],
    required: true,
  }],
  permissions: PermissionFlagsBits.ManageGuild,
}, async interaction => {
  const reply = content => interaction.reply({ content, ephemeral: true });

  const category = interaction.options.getChannel('category');

  if (!category.permissionsFor(interaction.guild.members.me).has(PermissionFlagsBits.ViewChannel
    | PermissionFlagsBits.SendMessages
    | PermissionFlagsBits.EmbedLinks
    | PermissionFlagsBits.AttachFiles
    | PermissionFlagsBits.ManageChannels)) {
    return await reply('The bot must have View Channel, Send Messages, Embed Links, Attach Files, and Manage Channels in the modmail category.');
  }

  await interaction.client.db.modmailSettings.findOneAndUpdate(
    { guild: interaction.guild.id },
    { $set: { category: category.id } },
    { upsert: true }
  );

  await reply(`The modmail category has been set to \`${escapeInlineCode(category.name)}\`.`);
});
