import { ApplicationCommandOptionType } from '@aroleaf/djs-bot';
import * as util from '../../../lib/util.js';
import * as autocomplete from '../../../lib/autocomplete.js';
import { AutoRoleType } from '../../../lib/constants.js';
import parent from './index.js';

parent.subcommand({
  name: 'remove',
  description: 'Remove a role synchronization between Discord and the TCN API',
  options: [{
    type: ApplicationCommandOptionType.Role,
    name: 'discord',
    description: 'The discord role of this synchronization',
    required: true,
  }, {
    type: ApplicationCommandOptionType.Number,
    name: 'type',
    description: 'The type of synchronization you want to remove',
    choices: [
      { name: 'Server to Discord', value: AutoRoleType.APIGuildToDiscord },
      { name: 'TCN role to Discord', value: AutoRoleType.APIRoleToDiscord },
      { name: 'Discord to TCN role (TCN observers only)', value: AutoRoleType.DiscordToAPIRole },
    ],
    required: true,
  }, {
    type: ApplicationCommandOptionType.String,
    name: 'role',
    description: 'The TCN role of this synchronization. Required if the `type` option is not "Server to Discord"',
  }, {
    type: ApplicationCommandOptionType.String,
    name: 'server',
    description: 'The server of this synchronization. Required if the `type` option is "Server to Discord"',
    autocomplete: true,
    onAutocomplete: autocomplete.server,
  }],
}, async interaction => {
  const reply = content => interaction.reply({ content, ephemeral: true });

  const type = interaction.options.getNumber('type');
  const dscRole = interaction.options.getRole('discord');
  const server = interaction.options.getString('server');
  const role = interaction.options.getString('role');

  const apiData = await util.getAPIData(interaction);
  if (!apiData.guild) return reply('This guild does not seem to be part of the TCN.');
  if (!(apiData.observer || interaction.memberPermissions.has(PermissionFlagsBits.ManageRoles))) return reply('Only people with the MANAGE_ROLES permission, or a TCN observer can synchronize roles.');

  if (type === AutoRoleType.APIGuildToDiscord) {
    if (!server) return reply('The `server` option is required when the `type` option is "Server to Discord".');
  } else if (!role) return reply('The `role` option is required when the `type` option is "TCN role to Discord" or "Discord to TCN role".');

  const data = {
    guild: interaction.guildId,
    discord: dscRole.id,
    api: type === AutoRoleType.APIGuildToDiscord ? server : role,
    type,
  }

  const doc = await interaction.client.db.autoRoles.findOne(data);
  if (!doc) return reply('A role synchronization with those settings doesn\'t exist.');
  
  await doc.deleteOne();
  return reply('Synchronization successfully removed.');
});