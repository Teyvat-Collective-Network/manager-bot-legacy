import parent from './index.js';

parent.subcommand({
  name: 'members',
  description: 'Lists all registered staff members of this server',
}, async interaction => {
  const reply = content => interaction.reply({ content, ephemeral: true });
  
  const users = await interaction.client.tcn.fetchUsers().then(all => all.filter(u => u.guilds.includes(interaction.guildId)));

  return reply(users.length
    ? `The registered staff members for this server are: ${users.map(u => `<@${u.id}>`).join(', ')}`
    : 'This server has no registered staff.'  
  );
});