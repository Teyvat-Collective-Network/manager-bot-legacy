import { ApplicationCommandOptionType } from '@aroleaf/djs-bot';
import { fetchModmailChannel, serverAddPrompt } from '../../../lib/modmail.js';
import parent from './index.js';

parent.subcommand({
  name: 'open',
  description: 'Open a new modmail thread',
  options: [{
    type: ApplicationCommandOptionType.String,
    name: 'name',
    description: 'The name of the modmail thread',
    required: true,
    maxLength: 80,
  }]
}, async interaction => {
  const settings = await interaction.client.db.modmailSettings.findOne({ guild: interaction.guild.id });
  if (!settings?.logChannel)
    return await interaction.reply({
      content: 'Modmail is not set up in this server; you must set the channel with **/tcn-mail log-channel** and optionally the modmail category with **/tcn-mail category**.',
      ephemeral: true,
    });
  
  await interaction.deferReply({ ephemeral: true });
  const reply = (content) => interaction.editReply({ content });

  const name = interaction.options.getString('name');

  const prompt = await serverAddPrompt(interaction);
  
  const [channel, error] = await fetchModmailChannel(interaction.guild, null, { name });
  if (error) return await reply(error);

  const uuid = crypto.randomUUID();

  await interaction.client.db.threadInterServer.create({
    uuid,
    owner: interaction.guild.id,
    name,
    escalated: interaction.guild.id === process.env.HQ,
    open: true
  });

  await interaction.client.db.threadParticipant.create({
    thread: uuid,
    guild: interaction.guild.id,
    channel: channel.id,
    connected: true,
    subscribers: [],
    silenced: 0,
  });

  try {
    await interaction.client.channels.cache.get(settings.logChannel).send({
      embeds: [{
        title: 'Modmail Thread Opened',
        description: `A new modmail thread was opened by ${interaction.user} here: ${channel}. The transcript is available [here](${process.env.MODMAIL_DOMAIN}/transcript/${uuid}).`,
        color: 0x2d3136,
      }],
    });
  } catch {}

  if (settings.pingOnSelfOpen && settings.ping) {
    await channel.send(settings.ping);
  }

  await channel.send(prompt);

  await reply(`New modmail thread opened: ${channel}`);
});
