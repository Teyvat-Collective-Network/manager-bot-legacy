import { ApplicationCommandOptionType, CommandFlagsBitField, PermissionFlagsBits } from '@aroleaf/djs-bot';
import parent from '../index.js';
import buttons from './buttons.js';
import modal from './modal.js';

parent.subcommand({
  name: 'edit',
  description: 'Edit your TCN partner template.',
  flags: [CommandFlagsBitField.Flags.GUILD_ONLY],
  permissions: {
    user: [PermissionFlagsBits.ManageGuild],
  },
  options: [{
    type: ApplicationCommandOptionType.Attachment,
    name: 'template',
    description: 'A markdown (.md) file to use as a template for your partner list.',
  }],
}, async (interaction, options) => {
  if (!options.template) {
    const settings = await interaction.client.db.partnerlists.findOne({ guild: interaction.guild.id });
    const template = (options.template && await fetch(options.template.url).then(res => res.ok && res.text()).catch(console.error)) || settings?.template || interaction.client.partnerlists.defaultTemplate;
    return interaction.showModal(modal(template));
  }

  const template = await fetch(options.template.url).then(res => res.ok && res.text());
  const partnerlist = await interaction.client.partnerlists.get(template, interaction.guild);
  return interaction.reply(Object.assign(partnerlist.messages()[0], {
    ephemeral: true,
    components: [interaction.client.components.create(buttons(template))],
  }));
});