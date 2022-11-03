import { ApplicationCommandOptionType } from '@aroleaf/djs-bot';
import { update, util, autocomplete } from '../../../lib/index.js';
import parent from './index.js';

parent.subcommand({
  name: 'remove',
  description: 'Remove a server from the TCN',
  options: [{
    type: ApplicationCommandOptionType.String,
    name: 'server',
    description: 'The server to remove from the network',
    required: true,
    autocomplete: true,
    onAutocomplete: autocomplete.server,
  }],
}, async interaction => {
  const reply = content => interaction.reply({ content, ephemeral: true });

  const apiData = await util.getAPIData(interaction);
  if (!apiData.guild) return reply('This guild does not seem to be part of the TCN.');
  if (!(apiData.observer || apiData.owner)) return reply('A TCN server may only be removed from the network by its owner or a TCN observer.');

  const success = await interaction.client.tcn.deleteGuild(apiData.guild.id).catch(() => {});

  if (!success) return reply(`Failed to remove ${apiData.guild.name} from the network.`);
  await reply(`Successfully removed ${apiData.guild.name} from the network.`);

  const owner = interaction.client.users.resolve(apiData.guild.owner);
  const advisor = interaction.client.users.resolve(apiData.guild.advisor);
  await update.updateRoles([owner, advisor].filter(u => u)).catch(console.error);
});