import { ApplicationCommandOptionType, CommandFlagsBitField, PermissionFlagsBits, WebhookClient } from '@aroleaf/djs-bot';
import { util } from '../../../lib/index.js';
import parent from './index.js';

parent.subcommand({
  name: 'post',
  description: 'Post the TCN partner list.',
  flags: [CommandFlagsBitField.Flags.GUILD_ONLY],
  options: [{
    type: ApplicationCommandOptionType.Channel,
    name: 'channel',
    description: 'The channel to post the list in. Default: the current channel.',
  }, {
    type: ApplicationCommandOptionType.Boolean,
    name: 'repost',
    description: 'If the list should be sent again instead of editing when there\'s an update. Default: false.',
  }, {
    type: ApplicationCommandOptionType.String,
    name: 'webhook',
    description: 'If you want the bot to use a webhook instead of its own account, provide the webhook URL here.',
  }],
}, async (interaction, { channel = interaction.channel, repost = false, webhook }) => {
  const reply = content => interaction.reply({ content, ephemeral: true });

  const apiData = await util.getAPIData(interaction);
  if (!(apiData.observer || interaction.memberPermissions.has([PermissionFlagsBits.ManageMessages, PermissionFlagsBits.SendMessages]))) return reply('Only people with Manage Messages and Send Messages permissions, or a TCN observer can post partner lists.');

  const settings = await interaction.client.db.partnerlists.findOne({ guild: interaction.guild.id });
  if (settings?.instances.some(instance => instance.channel === channel.id)) return reply('There\'s already a partner list instance in that channel. Use `/partnerlist remove` to remove it.');
  const partnerlist = await interaction.client.partnerlists.get(settings?.template || interaction.client.partnerlists.defaultTemplate, interaction.guild);

  const message = webhook
    ? await new WebhookClient({ url: webhook }).send(partnerlist.messages()[0])
    : await channel.send(partnerlist.messages()[0]);

  console.log(message);

  const instance = {
    channel: channel.id,
    message: message.id,
    webhook, repost,
  }

  await interaction.client.db.partnerlists.updateOne(
    { guild: interaction.guild.id },
    { $push: { instances: instance } },
    { upsert: true }
  );

  return reply(`Partner list posted${message.url ? `[here](${message.url})` : ''}.`);
});