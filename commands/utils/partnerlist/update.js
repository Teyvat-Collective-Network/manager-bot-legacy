import { CommandFlagsBitField } from '@aroleaf/djs-bot';
import { util } from '../../../lib/index.js';
import parent from './index.js';

parent.subcommand({
  name: 'update',
  description: 'Update all partner list instances.',
  flags: [CommandFlagsBitField.Flags.GUILD_ONLY],
}, async (interaction) => {
  const reply = content => interaction.reply({ content, ephemeral: true });

  const apiData = await util.getAPIData(interaction);
  if (!apiData.observer) return reply('Sorry, only TCN observers can push partner list updates.');

  await interaction.deferReply({ ephemeral: true });

  const partnerlists = await interaction.client.db.partnerlists.find({});
  const failed = [];
  for (const doc of partnerlists) {
    const guild = interaction.client.guilds.resolve(doc.guild);
    const partnerlist = await interaction.client.partnerlists.get(doc.template || interaction.client.partnerlists.defaultTemplate, guild);
    const message = partnerlist.messages()[0];
    for (const instance of doc.instances) {
      const channel = guild.channels.resolve(instance.channel);
      if (!channel) continue;
      const msg = await channel.messages.fetch(instance.message);      
      if (msg) instance.repost ? await msg.delete().catch(console.error) : await msg.edit(message).catch(() => failed.push(channel));
      if (!msg || instance.repost) await channel.send(message).catch(() => failed.push(channel)).then(m => interaction.client.db.partnerlists.updateOne(
        { _id: doc._id, 'instances.channel': instance.channel },
        { $set: { 'instances.$.message': m.id } }
      ));
    }
  }

  return interaction.editReply(`Partner list update complete.${failed.length ? ` Failed to update: ${failed.map(channel => `[#${channel.name}](${channel.url}) in ${channel.guild.name}`).join(', ')}` : ''}`);
});