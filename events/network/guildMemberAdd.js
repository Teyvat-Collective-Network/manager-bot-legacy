import { Event, Events } from '@aroleaf/djs-bot';
import { updateMembers } from '../../lib/update.js';

export default new Event({
  event: Events.GuildMemberAdd,
}, async member => {
  await updateMembers([member]).catch(() => {});
});