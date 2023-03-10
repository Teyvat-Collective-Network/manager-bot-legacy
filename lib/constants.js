function makeEnum(object) {
  for (const [k, v] of Object.entries(object)) {
    object[v] = k;
  }
  return object;
}

export const WeaponType = makeEnum({
  Sword: 0,
  Claymore: 1,
  Polearm: 2,
  Catalyst: 3,
  Bow: 4,
  Other: 5,
});

export const Element = makeEnum({
  Pyro: 0,
  Hydro: 1,
  Anemo: 2,
  Electro: 3,
  Dendro: 4,
  Cryo: 5,
  Geo: 6,
  Other: 7,
});

export const AutoRoleType = makeEnum({
  APIGuildToDiscord: 0,
  APIRoleToDiscord: 1,
  DiscordToAPIGuild: 2,
  DiscordToAPIRole: 3,
});