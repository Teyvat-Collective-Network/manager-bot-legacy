import { Event, Events } from '@aroleaf/djs-bot';
import { updateAPI, updateMembers } from '../../lib/update.js';

export default new Event({
  event: Events.GuildMemberUpdate,
}, async (old, member) => {
  const different = old.roles.cache.size !== member.roles.cache.size || old.roles.cache.every(r => member.roles.resolve(r.id));
  if (!different) return;
  await updateAPI([member]);
  await updateMembers([member]);
});