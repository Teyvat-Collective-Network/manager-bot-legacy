import { ApplicationCommandOptionType, Colors } from "discord.js";

export const baseReplyOptions = [{
  type: ApplicationCommandOptionType.Boolean,
  name: 'anon',
  description: 'Whether to send this message anonymously (default: false)',
}, ...[...new Array(10).keys()].map(i => ({
  type: ApplicationCommandOptionType.Attachment,
  name: `file-${i + 1}`,
  description: 'A file to upload (up to 10)',
}))];

export async function getUUID(db) {
  while (true) {
    const uuid = crypto.randomUUID();
    if (await db.exists({ uuid })) continue;
    return uuid;
  }
}

export async function fetchModmailChannel(guild, target, options) {
  if (guild.channels.cache.has(target)) return [guild.channels.cache.get(target), null];

  const settings = await guild.client.db.modmailSettings.findOne({ guild: guild.id });
  if (!(settings?.category || settings?.logChannel)) return [null, `${guild.name} has not set up modmail.`];

  try {
    const category = settings.category
      ? guild.channels.cache.get(settings.category)
      : guild.channels.cache.get(settings.logChannel).parent;

    if (!category) return [null, `${guild.name}'s modmail channel could not be found.`];

    return [await category.children.create(options), null];
  } catch (error) {
    console.error(error);
    return [null, `Could not create a new modmail channel in ${guild.name}.`];
  }
}

export function copy_files(files, spoiler_level = 0) {
  const attachments = [];

  for (const attachment of files) {
    let name = attachment.name;
    const spoiler = name.startsWith('SPOILER_');
    name = name.match(/^(SPOILER_)*(.*)/)[2] || 'file';
    if ((spoiler_level === 0 && spoiler) || spoiler_level > 0) name = 'SPOILER_' + name;
    attachments.push({ attachment: attachment.url, name });
  }

  return attachments;
}

export async function fetchThread(interaction) {
  let thread = await interaction.client.db.threadUserToObserver.findOne({ targetChannel: interaction.channel.id, open: true });
  let dm = true;
  
  if (!thread) {
    const participant = await interaction.client.db.threadParticipant.findOne({ channel: interaction.channel.id });
    if (participant) {
      thread = await interaction.client.db.threadInterServer.findOne({ uuid: participant.thread, open: true });
      dm = false;
    }
  }

  return { thread, dm };
}

export async function relay(interaction, { content, anon, files }) {
  const reply = (content) => interaction.reply({ content, ephemeral: true });

  const { thread, dm } = await fetchThread(interaction);

  if (!thread) return await reply('This is not a modmail thread.');

  await interaction.deferReply();

  const embed = {
    description: content,
    color: 0x2d3136,
    author: anon ? null : { name: interaction.user.tag, iconURL: interaction.member.displayAvatarURL({ dynamic: true, size: 64 }) },
    footer: anon ? { text: 'This message was sent anonymously.' } : null,
  };

  files = files.map(file => ({ attachment: file.attachment, name: file.name }));

  if (dm) {
    try {
      const user = await interaction.client.users.fetch(thread.user);
      await user.send({ embeds: [{ title: 'Incoming Message', ...embed }] });
      await interaction.editReply({ embeds: [{ title: 'Outgoing Message', ...embed }], files });
    } catch {
      await interaction.editReply({
        embeds: [{
          title: 'Failed to send',
          description: 'The user could not be fetched or the message could not be fetched. This may be caused by the user leaving the server, turning off DMs, or blocking the bot.',
          color: Colors.Red,
        }],
        files,
      });
    }
  } else {
    // TODO
  }
}