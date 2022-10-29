import { SlashCommand } from '@aroleaf/djs-bot';

export default new SlashCommand({
  name: 'oomfie',
  description: 'didn\'t ask oomfie',
}, interaction => interaction.reply('https://media.tenor.com/lSz3P9d-xhcAAAAd/yogurt-cap-oomfie.gif'));