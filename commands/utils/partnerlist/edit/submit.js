import { ModalHandler, PermissionFlagsBits } from '@aroleaf/djs-bot';
import buttons from './buttons.js';

export default new ModalHandler({
  name: 'partnerlist.edit',
  permissions: {
    user: [PermissionFlagsBits.ManageGuild],
  },
}, async (interaction, fields) => {
  const template = fields.template || interaction.client.partnerlists.defaultTemplate;
  const partnerlist = await interaction.client.partnerlists.get(template, interaction.guild);
  
  const data = Object.assign(partnerlist.messages()[0], {
    ephemeral: true,
    components: [interaction.client.components.create(buttons(template))],
  });

  return interaction.isFromMessage() ? interaction.update(data) : interaction.reply(data);
});