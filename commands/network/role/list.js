import { ApplicationCommandOptionType } from '@aroleaf/djs-bot';
import parent from './index.js';

parent.subcommand({
  name: 'list',
  description: 'List the TCN roles a user has',
  options: [{
    type: ApplicationCommandOptionType.User,
    name: 'user',
    description: 'The user who\'s roles to list',
    required: true,
  }],
}, async interaction => {
  const reply = content => interaction.reply({ content, ephemeral: true });
  
  const user = interaction.options.getUser('user');
  const apiUser = await interaction.client.tcn.fetchUser(user.id).catch(() => {});

  return reply(apiUser?.roles.length
    ? `TCN roles for ${user}: ${apiUser.roles.map(role => `\`${role}\``).join(', ')}.`
    : `${user} has no TCN roles.`
  );
});