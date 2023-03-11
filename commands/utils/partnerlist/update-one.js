import { ApplicationCommandOptionType, ApplicationCommandType, CommandFlagsBitField, ContextCommand, PermissionFlagsBits, WebhookClient } from '@aroleaf/djs-bot';
import { util } from '../../../lib/index.js';
import parent from './index.js';

async function handler(interaction, { message, messageId}) {
  const reply = content => interaction.reply({ content, ephemeral: true });

  
  const settings = await interaction.client.db.partnerlists.findOne({ guild: interaction.guild.id });
  const instance = settings.instances.find(instance => instance.message === messageId);
  if (!instance) return reply('That message is not a partner list instance.');
  
  const channel = interaction.guild.channels.resolve(instance.channel);
  if (!channel || channel?.guild.id !== interaction.guild.id) return reply('That message is not in this server, or I do not have access to it.');
  
  const apiData = await util.getAPIData(interaction);
  if (!(apiData.observer || interaction.member.permissionsIn(channel).has([PermissionFlagsBits.ManageMessages, PermissionFlagsBits.SendMessages]))) return reply('Only people with Manage Messages and Send Messages permissions, or a TCN observer can remove partner lists.');
  
  message ||= await channel.messages.fetch(instance.message);

  const partnerlist = await interaction.client.partnerlists.get(settings.template || interaction.client.partnerlists.defaultTemplate, interaction.guild);

  const webhookClient = instance.webhook && new WebhookClient({ url: instance.webhook });
  const send = (msg) => webhookClient ? webhookClient.send(msg) : channel.send(msg);
  const edit = (msg) => webhookClient ? webhookClient.editMessage(instance.message, msg) : channel.messages.edit(instance.message, msg);
  const del = () => webhookClient ? webhookClient.deleteMessage(instance.message) : channel.messages.delete(instance.message);
  let failed = false;
  if (message) instance.repost ? await del().catch(console.error) : await edit(partnerlist.messages()[0]).catch(e => (failed = true) && console.error(e));
  if (!message || instance.repost) await send(partnerlist.messages()[0]).then(m => interaction.client.db.partnerlists.updateOne(
    { 'instances.channel': instance.channel },
    { $set: {
      'instances.$.message': m.id,
      ...instance.webhook ? { 'instances.$.channel': m.channel_id } : {},
    } }
  )).catch(e => (failed = true) && console.error(e));

  return reply(failed ? 'Failed to update partner list instance.' : 'Partner list instance updated.');
}

parent.subcommand({
  name: 'update-instance',
  description: 'Update a specific partner list instance.',
  flags: [CommandFlagsBitField.Flags.GUILD_ONLY],
  options: [{
    type: ApplicationCommandOptionType.String,
    name: 'message',
    description: 'The message ID of the partner list instance to update.',
  }],
}, async (interaction, { message }) => handler(interaction, { messageId: message }));

export default new ContextCommand({
  type: ApplicationCommandType.Message,
  name: 'update partnerlist',
  flags: [CommandFlagsBitField.Flags.GUILD_ONLY],
}, async (interaction, message) => handler(interaction, { message, messageId: message.id, message }));