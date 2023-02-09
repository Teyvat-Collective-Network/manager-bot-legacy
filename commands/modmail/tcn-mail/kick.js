import { ApplicationCommandOptionType } from "@aroleaf/djs-bot";
import { fetchThread, serverAddPrompt } from '../../../lib/modmail.js';

import parent from './index.js';

parent.subcommand({
  name: 'kick',
  description: 'Kick a server from the modmail thread',
  options: [{
    type: ApplicationCommandOptionType.String,
    name: 'server',
    description: 'the server to kick',
    autocomplete: true,
    onAutocomplete: async interaction => {
      const { thread, dm } = await fetchThread(interaction);

      if (!thread || dm) return await interaction.respond([]);

      const participants = (await interaction.client.db.threadParticipant.find({ thread: thread.uuid })).map(participant => participant.guild);

      const query = interaction.options.getFocused().toLowerCase();

      await interaction.respond(
        participants
          .filter(id => id !== interaction.guild.id && id !== process.env.HQ)
          .map(id => interaction.client.guilds.cache.get(id))
          .filter(guild => guild && guild.name.toLowerCase().indexOf(query) !== -1)
          .slice(0, 25)
          .map(guild => ({ name: guild.name, value: guild.id }))
      );
    }
  }]
}, async interaction => {
  const reply = (content, ephemeral = true) => interaction.reply({ content, ephemeral });

  const { thread, dm } = await fetchThread(interaction);

  if (!thread) return await reply('This is not a modmail thread.');
  if (dm) return await reply('You cannot kick anyone from a DM-to-observer thread.');
  if (thread.owner !== interaction.guild.id) return await reply('Only the owner server can kick servers from the thread.');

  const server = interaction.options.getString('server');
  if (server === interaction.guild.id) return await reply('You cannot kick yourself from a thread.');
  if (server === process.env.HQ) return await reply('You cannot kick the observer team from a thread.');

  const value = await interaction.client.db.threadParticipant.findOneAndDelete({ thread: thread.uuid, guild: server });

  if (!value) return await reply('That server is not a participant of this thread.');

  const target = interaction.client.guilds.cache.get(server)?.name ?? 'an unknown server';

  await reply(`${target} was kicked from the thread.`, false);

  await interaction.client.channels.cache.get(value.channel)?.send({
    embeds: [{
      title: 'Modmail Thread Disconnected',
      description: 'You were kicked from the thread.',
      color: 0x2d3136,
    }],
  }).catch(() => {});


  for (const participant of await interaction.client.db.threadParticipant.find({ thread: thread.uuid, guild: { $ne: interaction.guild.id }})) {
    await interaction.client.channels.cache.get(participant.channel)?.send({
      embeds: [{
        title: 'Server Kicked',
        description: `${interaction.guild.name} kicked ${target} from the thread.`,
        color: 0x2d3136,
      }],
    }).catch(() => {});
  }

  await interaction.client.db.modmailMessage.create({
    thread: thread.uuid,
    type: 'cross-server-kick',
    time: new Date(),
    author: interaction.user.id,
    origin: interaction.guild.id,
    content: server,
  });
});
