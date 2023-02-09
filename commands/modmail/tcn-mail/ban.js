import { ApplicationCommandOptionType } from "discord.js";
import { util } from "../../../lib/index.js";
import parent from './index.js';

parent.subcommand({
  name: 'ban',
  description: 'Ban a user from using user-to-observer modmail',
  options: [{
    type: ApplicationCommandOptionType.User,
    name: 'user',
    description: 'The user to ban',
    required: true,
  }],
}, async interaction => {
  const reply = content => interaction.reply({ content, ephemeral: true });

  const apiData = await util.getAPIData(interaction);
  if (!apiData.observer) return await reply('Only observers may use this command.');

  const user = interaction.options.getUser('user');

  const old = await interaction.client.db.bannedUsers.findOneAndUpdate(
    { user: user.id },
    { $set: {} },
    { upsert: true },
  );

  await reply(old ? 'That user is already banned.' : `Banned ${user} from using modmail.`);
});
