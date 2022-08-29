import { Event, Events } from '@aroleaf/djs-bot';
import { updateAPI } from '../../lib/update.js';

export default new Event({
  event: Events.GuildMemberRemove,
}, async member => {
  await updateAPI([member]).catch(() => {});
});