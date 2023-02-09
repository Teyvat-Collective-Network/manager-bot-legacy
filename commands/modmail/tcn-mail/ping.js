import { ApplicationCommandOptionType, PermissionFlagsBits } from '@aroleaf/djs-bot';
import parent from './index.js';

parent.subcommand({
  name: 'ping',
  description: 'Set the ping (can be any message) to be sent when threads open',
  options: [{
    type: ApplicationCommandOptionType.String,
    name: 'message',
    description: 'The message to send',
    maxLength: 1024,
  }, {
    type: ApplicationCommandOptionType.Boolean,
    name: 'ping-on-self-open',
    description: 'Whether or not to ping when the thread is opened from this server',
  }],
}, async interaction => {
  const reply = content => interaction.reply({ content, ephemeral: true });

  if (!interaction.member.permissions.has(PermissionFlagsBits.ManageGuild)) return await reply('Insufficient permissions.');

  const message = interaction.options.getString('message');
  const pingOnSelfOpen = interaction.options.getBoolean('ping-on-self-open');

  const $set = {};
  if (message !== null) $set.ping = message;
  if (pingOnSelfOpen !== null) $set.pingOnSelfOpen = pingOnSelfOpen;

  if (Object.keys($set).length === 0) return await reply('No settings were updated.');

  await interaction.client.db.modmailSettings.findOneAndUpdate({ guild: interaction.guild.id }, { $set }, { upsert: true });

  await reply('Alert settings have been updated.');
});
