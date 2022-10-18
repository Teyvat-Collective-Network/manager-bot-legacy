import { ApplicationCommandOptionType } from '@aroleaf/djs-bot';
import { update, util, autocomplete } from '../../../lib/index.js';
import parent from './index.js';

parent.subcommand({
  name: 'update',
  description: 'Update a TCN server',
  options: [{
    type: ApplicationCommandOptionType.String,
    name: 'server',
    description: 'The server to update',
    required: true,
    autocomplete: true,
    onAutocomplete: autocomplete.server,
  }, {
    type: ApplicationCommandOptionType.String,
    name: 'invite',
    description: 'An permanent, non-vanity invite to the server',
  }, {
    type: ApplicationCommandOptionType.User,
    name: 'owner',
    description: 'The owner of the server (pasting a user ID should work)',
  }, {
    type: ApplicationCommandOptionType.User,
    name: 'advisor',
    description: 'The advisor for the server (pasting a user ID should work)',
  }, {
    type: ApplicationCommandOptionType.Integer,
    name: 'voter',
    description: 'The voter for the server',
    choices: [{ name: 'Owner', value: 0 }, { name: 'Advisor', value: 1 }, { name: 'None', value: 2 }],
  }, {
    type: ApplicationCommandOptionType.String,
    name: 'name',
    description: 'The shortened name of the server ("Sayu Mains | Genshin Impact" => "Sayu Mains")',
  }],
}, async interaction => {
  const reply = content => interaction.reply({ content, ephemeral: true });

  const apiData = await util.getAPIData(interaction);
  if (!apiData.guild) return reply('This guild does not seem to be part of the TCN.');
  if (!(apiData.observer || apiData.owner)) return reply('A TCN server may only be updated by its owner or a TCN observer.');

  const inviteString = interaction.options.getString('invite');
  const invite = inviteString && await interaction.client.fetchInvite(inviteString);
  if (invite) {
    if (invite.guild.id !== apiData.guild.id) return reply('The provided invite belongs to another server.');
    if (invite.expiresTimestamp) return reply('The provided invite is not permantent, please provide a permanent invite instead.');
    if (invite.guild.vanityURLCode === invite.code) return reply('The provided invite seems to be the server\'s vanity invite, please use a non-vanity invite instead.');
  }

  const owner = interaction.options.getUser('owner')?.id || apiData.guild.owner;
  const advisor = interaction.options.getUser('advisor')?.id || apiData.guild.advisor;
  if (owner === advisor) return reply('The owner can\'t also be the advisor.');
  
  const voterInt = interaction.options.getInteger('voter');
  if (voterInt === 1 && !advisor) return reply('The advisor can\'t be the voter if there\'s no advisor.');
  const voter = [owner, advisor, null][voterInt || 0];

  const success = await interaction.client.tcn.editGuild(apiData.guild.id, {
    invite: invite?.code || undefined,
    name: interaction.options.getString('name') || undefined,
    owner, advisor, voter,
  }).catch(() => {});

  if (!success) return reply(`Failed to update ${apiData.guild.name}.`);
  await reply(`Successfully updated ${apiData.guild.name}.`);

  const users = [];
  if (apiData.guild.owner !== owner) users.push(apiData.guild.owner, owner);
  if (apiData.guild.advisor !== advisor) users.push(apiData.guild.advisor, advisor);
  if (apiData.guild.voter !== voter) users.push(apiData.guild.voter, voter);

  for (const userId of [...new Set(users)]) {
    const user = interaction.client.users.resolve(userId);
    await user && update.updateUser(user);
  }
});