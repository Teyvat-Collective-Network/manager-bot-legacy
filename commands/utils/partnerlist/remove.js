import { ApplicationCommandOptionType, ApplicationCommandType, CommandFlagsBitField, ContextCommand, PermissionFlagsBits } from '@aroleaf/djs-bot';
import { util } from '../../../lib/index.js';
import parent from './index.js';

async function handler(interaction, { message, messageId}) {
  const reply = content => interaction.reply({ content, ephemeral: true });

  const apiData = await util.getAPIData(interaction);
  if (!(apiData.observer || interaction.memberPermissions.has([PermissionFlagsBits.ManageMessages, PermissionFlagsBits.SendMessages]))) return reply('Only people with Manage Messages and Send Messages permissions, or a TCN observer can remove partner lists.');

  const settings = await interaction.client.db.partnerlists.findOne({ guild: interaction.guild.id });
  const instance = settings.instances.find(instance => instance.message === messageId);
  if (!instance) return reply('That message is not a partner list instance.');

  message ||= await interaction.client.channels.resolve(instance.channel)?.messages.fetch(instance.message);
  if (message?.deletable) await message.delete();
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
    required: true,
  }],
}, async (interaction, { message }) => handler(interaction, { messageId: message }));

export default new ContextCommand({
  type: ApplicationCommandType.Message,
  name: 'remove partnerlist',
  flags: [CommandFlagsBitField.Flags.GUILD_ONLY],
}, async (interaction, message) => handler(interaction, { message, messageId: message.id }));