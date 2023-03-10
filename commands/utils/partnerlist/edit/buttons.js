import { ButtonStyle, ComponentType } from '@aroleaf/djs-bot';
import DME from 'discord-markdown-embeds';
import modal from './modal.js';

export default template => [{
  type: ComponentType.Button,
  style: ButtonStyle.Danger,
  label: 'Cancel',
  async run(interaction) {
    return interaction.update({ components: [] });
  }
}, {
  type: ComponentType.Button,
  style: ButtonStyle.Secondary,
  label: 'Edit',
  async run(interaction) {
    return interaction.showModal(modal(template));
  }
}, {
  type: ComponentType.Button,
  style: ButtonStyle.Success,
  label: 'Save',
  async run(interaction) {
    await interaction.client.db.partnerlists.updateOne({ guild: interaction.guild.id }, { template }, { upsert: true });
    return interaction.update({ embeds: DME.render(`
      ---
      color: 0x2d3136
      ---
      # Partner list template saved!
      Your partner list template has been saved.
    `), components: [] });
  },
}];