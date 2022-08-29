import { ApplicationCommandOptionType } from '@aroleaf/djs-bot';
import * as autocomplete from '../../../lib/autocomplete.js';
import * as util from '../../../lib/util.js';
import parent from './index.js';

parent.subcommand({
  name: 'add',
  description: 'Add a server to the TCN',
  options: [{
    type: ApplicationCommandOptionType.String,
    name: 'character',
    description: 'The character the server mains',
    required: true,
    autocomplete: true,
    onAutocomplete: autocomplete.character,
  }, {
    type: ApplicationCommandOptionType.String,
    name: 'invite',
    description: 'An permanent, non-vanity invite to the server',
    required: true,
  }, {
    type: ApplicationCommandOptionType.User,
    name: 'owner',
    description: 'The owner of the server (pasting a user ID should work)',
    required: true,
  }, {
    type: ApplicationCommandOptionType.User,
    name: 'advisor',
    description: 'The advisor for the server (pasting a user ID should work)',
  }, {
    type: ApplicationCommandOptionType.Integer,
    name: 'voter',
    description: 'The voter for the server (defaults to the owner)',
    choices: [{ name: 'Owner', value: 0 }, { name: 'Advisor', value: 1 }, { name: 'None', value: 2 }],
  }, {
    type: ApplicationCommandOptionType.String,
    name: 'name',
    description: 'The shortened name of the server ("Sayu Mains | Genshin Impact" => "Sayu Mains")',
  }],
}, async interaction => {
  const reply = content => interaction.reply({ content, ephemeral: true });

  const apiData = await util.getAPIData(interaction);
  if (!apiData.observer) return reply('Sorry, only TCN observers can add servers to the network.');

  const invite = await interaction.client.fetchInvite(interaction.options.getString('invite'), {  }).catch(() => {});
  if (!invite) return reply('The provided invite seems to be invalid.');
  if (invite.expiresTimestamp) return reply('The provided invite is not permantent, please provide a permanent invite instead.');
  if (invite.guild.vanityURLCode === invite.code) return reply('The provided invite seems to be the server\'s vanity invite, please provide a non-vanity invite instead.');

  const owner = interaction.options.getUser('owner').id;
  const advisor = interaction.options.getUser('advisor')?.id;
  if (owner === advisor) return reply('The owner can\'t also be the advisor.');

  const voterInt = interaction.options.getInteger('voter');
  if (voterInt === 1 && !advisor) return reply('The advisor can\'t be the voter if there\'s no advisor.');
  const voter = [owner, advisor, null][voterInt || 0];

  const name = interaction.options.getString('name') || invite.guild.name;

  const guild = await interaction.client.tcn.createGuild({
    id: invite.guild.id,
    invite: invite.code,
    character: interaction.options.getString('character'),
    name, owner, advisor, voter,
  }).catch(() => {});

  return reply(guild 
    ? `Successfully added ${name} to the network`
    : `Failed to add ${name}. Maybe they're already in the network?`
  );
});