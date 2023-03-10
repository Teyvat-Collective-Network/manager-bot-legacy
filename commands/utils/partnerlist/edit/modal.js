import { ComponentType, TextInputStyle } from '@aroleaf/djs-bot';

export default template => ({
  customId: 'partnerlist.edit',
  title: 'Edit your TCN partner list template',
  components: [{
    type: ComponentType.ActionRow,
    components: [{
      type: ComponentType.TextInput,
      style: TextInputStyle.Paragraph,
      customId: 'template',
      placeholder: 'template',
      label: 'Template',
      value: template,
      required: false,
    }],
  }],
});