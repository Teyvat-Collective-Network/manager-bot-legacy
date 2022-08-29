import { ApplicationCommandOptionType } from '@aroleaf/djs-bot';
import parent from './index.js';

parent.subcommand({
  name: 'list',
  description: 'List the TCN servers a user is staff in',
  options: [{
    type: ApplicationCommandOptionType.User,
    name: 'user',
    description: 'The user who\'s staff servers to list',
    required: true,
  }],
}, async interaction => {
  const reply = content => interaction.reply({ content, ephemeral: true });
  
  const user = interaction.options.getUser('user');
  const apiUser = await interaction.client.tcn.fetchUser(user.id).catch(() => {});

  if (!apiUser?.guilds.length) return reply(`${user} isn\'t staff in any TCN server.`);

  const guilds = await interaction.client.tcn.fetchGuilds().catch(() => []);

  return reply(`${user} is staff in:\n${apiUser.guilds
    .map(guild => guilds.find(g => g.id === guild)?.name)
    .filter(g => g)
    .join('\n')
  }`);
});