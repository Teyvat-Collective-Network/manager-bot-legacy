import { ApplicationCommandOptionType } from "discord.js";
import parent from './index.js';

parent.subcommand({
  name: 'ban',
  description: 'Ban a user from using user-to-observer modmail.',
  options: [{
    type: ApplicationCommandOptionType.User,
    name: 'user',
    description: 'The user to ban',
    required: true,
  }],
}, async interaction => {
  const reply = content => interaction.reply({ content, ephemeral: true });

  const user = interaction.options.getUser('user');

  const old = await interaction.client.db.bannedUsers.findOneAndUpdate(
    { user: user.id },
    { $set: {} },
    { upsert: true },
  );

  await reply(old ? 'That user is already banned.' : `Banned ${user} from using modmail.`);
})
