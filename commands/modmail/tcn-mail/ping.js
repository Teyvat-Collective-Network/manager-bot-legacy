import { ApplicationCommandOptionType, PermissionFlagsBits } from "@aroleaf/djs-bot";
import parent from './index.js';

parent.subcommand({
  name: 'ping',
  description: 'Set the ping (can be any message) to be sent when threads open',
  options: [{
    type: ApplicationCommandOptionType.String,
    name: 'message',
    description: 'The message to send',
    maxLength: 1024,
  }],
  permissions: PermissionFlagsBits.ManageGuild,
}, async interaction => {
  const reply = content => interaction.reply({ content, ephemeral: true });

  const message = interaction.options.getString('message') ?? '';

  await interaction.client.db.modmailSettings.findOneAndUpdate(
    { guild: interaction.guild.id },
    { $set: { ping: message } },
    { upsert: true }
  );

  await reply(message ? 'Alert ping content has been set.' : 'Alert ping content has been cleared.');
});
