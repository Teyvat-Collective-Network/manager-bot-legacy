import parent from './index.js';
import { updateMembers, updateAPI } from '../../../lib/update.js';

parent.subcommand({
  name: 'all',
  description: 'update synchronized roles for all members of this server',
}, async interaction => {
  await interaction.deferReply({ ephemeral: true });

  const members = await interaction.guild.members.fetch();

  await updateMembers(members);
  await updateAPI(members);

  return interaction.editReply(`Synchronized roles for all ${members.size} members.`);
});