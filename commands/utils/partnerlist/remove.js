import { ApplicationCommandOptionType, ApplicationCommandType, CommandFlagsBitField, ContextCommand, PermissionFlagsBits, WebhookClient } from '@aroleaf/djs-bot';
import { util } from '../../../lib/index.js';
import parent from './index.js';

async function handler(interaction, { message, messageId}) {
  const reply = content => interaction.reply({ content, ephemeral: true });

  const settings = await interaction.client.db.partnerlists.findOne({ guild: interaction.guild.id });
  const instance = settings?.instances.find(instance => instance.message === messageId);
  if (!instance) return reply('That message is not a partner list instance.');
  
  const channel = interaction.guild.channels.resolve(instance.channel);
  if (!channel || channel?.guild.id !== interaction.guild.id) return reply('That message is not in this server, or I do not have access to it.');
  
  const apiData = await util.getAPIData(interaction);
  if (!(apiData.observer || interaction.member.permissionsIn(channel).has([PermissionFlagsBits.ManageMessages, PermissionFlagsBits.SendMessages]))) return reply('Only people with Manage Messages and Send Messages permissions, or a TCN observer can remove partner lists.');

  message ||= await channel.messages.fetch(instance.message);
  message && (instance.webhook
    ? new WebhookClient({ url: instance.webhook }).deleteMessage(message)
    : message.deletable && await message.delete()
  );
  await interaction.client.db.partnerlists.updateOne({ guild: interaction.guild.id }, { $pull: { instances: instance } });

  return reply('Partner list instance removed.');
}

parent.subcommand({
  name: 'remove',
  description: 'Remove a partner list instance.',
  flags: [CommandFlagsBitField.Flags.GUILD_ONLY],
  options: [{
    type: ApplicationCommandOptionType.String,
    name: 'message',
    description: 'The message ID of the partner list instance to remove.',
  }],
}, async (interaction, { message }) => {
  if (!message) {
    const settings = await interaction.client.db.partnerlists.findOne({ guild: interaction.guild.id });
    message = settings?.instances.find(i => i.channel = interaction.channelId)?.message;
    if (!message) return reply('There is no partnerlist instance registered in this channel.');
  }

  return handler(interaction, { messageId: message });
});

export default new ContextCommand({
  type: ApplicationCommandType.Message,
  name: 'remove partnerlist',
  flags: [CommandFlagsBitField.Flags.GUILD_ONLY],
}, async (interaction, message) => handler(interaction, { message, messageId: message.id }));