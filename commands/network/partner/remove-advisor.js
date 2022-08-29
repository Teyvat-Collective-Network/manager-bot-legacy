import { ApplicationCommandOptionType } from '@aroleaf/djs-bot';
import * as autocomplete from '../../../lib/autocomplete.js';
import * as util from '../../../lib/util.js';
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

  const success = await interaction.client.tcn.editGuild(apiData.guild.id, { advisor: null });

  return reply(success
    ? `Successfully removed the advisor from ${apiData.guild.name}.`
    : `Failed to remove the advisor from ${apiData.guild.name}.`
  );
});