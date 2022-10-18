import { ApplicationCommandOptionType, PermissionFlagsBits } from '@aroleaf/djs-bot';
import { update, util, autocomplete, constants } from '../../../lib/index.js';
import parent from './index.js';

const { AutoRoleType } = constants;

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
  await reply('Synchronization successfully removed. Roles will be updated in the background.');

  for (const [,guild] of interaction.client.guilds.cache) {
    type === AutoRoleType.DiscordToAPIRole
      ? await update.updateAPI([...guild.members.cache.values()]).catch(console.error)
      : await update.updateMembers([...guild.members.cache.values()]).catch(console.error);
  }
});