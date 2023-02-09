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
