import { ApplicationCommandOptionType } from "discord.js";
import parent from './index.js';

parent.subcommand({
  name: 'unban',
  description: 'Unban a user from using user-to-observer modmail.',
  options: [{
    type: ApplicationCommandOptionType.User,
    name: 'user',
    description: 'The user to unban',
    required: true,
  }],
}, async interaction => {
  const reply = content => interaction.reply({ content, ephemeral: true });

  const user = interaction.options.getUser('user');

  const old = await interaction.client.db.bannedUsers.findOneAndDelete({ user: user.id });

  await reply(old ? `Unbanned ${user} and they can now use modmail.` : 'That user is not banned.');
})
