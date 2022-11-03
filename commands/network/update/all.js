import parent from './index.js';
import { updateAPI, updateRoles } from '../../../lib/update.js';

parent.subcommand({
  name: 'all',
  description: 'update synchronized roles for all members of this server',
}, async interaction => {
  await interaction.deferReply({ ephemeral: true });

  const users = [...interaction.client.users.cache.values()]

  await updateRoles(users);
  await updateAPI(users);

  return interaction.editReply(`Synchronized roles for all ${users.length} members.`);
});