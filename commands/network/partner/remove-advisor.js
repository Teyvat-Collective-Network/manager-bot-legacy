import { ApplicationCommandOptionType } from '@aroleaf/djs-bot';
import { update, util, autocomplete } from '../../../lib/index.js';
import parent from './index.js';

parent.subcommand({
  name: 'remove-advisor',
  description: 'Updates a server to not have an advisor',
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
  if (!(apiData.observer || apiData.owner)) return reply('A TCN server may only be updated by its owner or a TCN observer.');

  if (!apiData.guild.advisor) return reply(`${apiData.guild.name} has no advisor.`);
  if (apiData.guild.advisor === apiData.guild.voter) return reply(`An advisor can't be removed from a server if they are the voter for that server.`);
  const success = await interaction.client.tcn.editGuild(apiData.guild.id, { advisor: null });

  if (!success) return reply(`Failed to remove the advisor from ${apiData.guild.name}.`)
  await reply(`Successfully removed the advisor from ${apiData.guild.name}.`);

  const advisor = interaction.client.users.resolve(apiData.guild.advisor);
  await advisor && update.updateUser(advisor);
});