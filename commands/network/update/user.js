import parent from './index.js';
import { updateAPI, updateRoles } from '../../../lib/update.js';
import { ApplicationCommandOptionType } from '@aroleaf/djs-bot';

parent.subcommand({
  name: 'user',
  description: 'update synchronized roles for one user',
  options: [{
    type: ApplicationCommandOptionType.User,
    name: 'user',
    description: 'The user who\'s roles to update',
    required: true,
  }],
}, async interaction => {
  await interaction.deferReply({ ephemeral: true });

  const user = interaction.options.getUser('user');
  if (!user) return reply('Sorry, I couldn\'t find that user.');

  await updateRoles([user]);
  await updateAPI([user]);

  return interaction.editReply(`Synchronized ${user}'s roles.`);
});