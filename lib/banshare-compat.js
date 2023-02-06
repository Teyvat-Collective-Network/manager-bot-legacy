import { SlashCommand } from '@aroleaf/djs-bot';

export async function getBanshareCommands() {
  const rawCommands = await fetch(process.env.BANSHARE_COMMAND_URL).then(res => res.ok ? res.json() : []);
  return rawCommands.map(commandData => new SlashCommand(commandData, () => {}));
}