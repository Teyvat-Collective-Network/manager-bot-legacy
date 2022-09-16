import parent from './index.js';
import { updateMembers, updateAPI } from '../../../lib/update.js';
import { ApplicationCommandOptionType } from '@aroleaf/djs-bot';

parent.subcommand({
  name: 'member',
  description: 'update synchronized roles for one member of this server',
  options: [{
    type: ApplicationCommandOptionType.User,
    name: 'member',
    description: 'The member who\'s roles to update',
    required: true,
  }],
}, async interaction => {
  const reply = content => interaction.reply({ content, ephemeral: true });

  const member = interaction.options.getMember('member');
  if (!member) return reply('Sorry, I couldn\'t find that member.');

  await updateMembers([member]);
  await updateAPI([member]);

  return reply(`Synchronized ${member}'s roles.`);
});