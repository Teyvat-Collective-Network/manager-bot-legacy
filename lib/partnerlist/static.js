export default {
  ul: '➜ ',
  tcn: {
    url: 'https://teyvatcollective.network',
    link: '[teyvatcollective.network](https://teyvatcollective.network "the TCN website")',
    info: 'A network of high-quality Genshin Impact character-mains style servers that focus on creating fan communities. Within the network, individual and network-wide events are held such as: tournaments, scavenger hunts and other fun events, community nights, giveaways, and patch preview livestreams.',
  },

  hub: {
    url: 'https://discord.gg/FG2wpbywSx',
    link: '[discord.gg/FG2wpbywSx](https://discord.gg/FG2wpbywSx)',
    info: 'Join us in the official TCN hub to ask questions about the network, talk to other network members, get information on the network and how to apply, and contact observers (admins)!',
  },

  genshin_wizard: {
    url: 'https://genshinwizard.com/',
    link: '[genshinwizard.com](https://genshinwizard.com/)',
    info: 'The TCN is partnered with [Genshin Wizard](https://genshinwizard.com/), a multipurpose Genshin Impact Discord bot with a wide array of features to let you view your in-game stats, flex your builds, view build guides and hundreds of high-quality infographics, and more!',
  },

  tavern: {
    url: 'https://discord.gg/genshinimpacttavern',
    link: '[discord.gg/genshinimpacttavern](https://discord.gg/genshinimpacttavern)',
    info: 'The TCN is partnered with [Genshin Impact Tavern](https://discord.gg/genshinimpacttavern), a multifaceted Discord Community Server hosting a custom bot designed to emulate an "RPG-like" experience. This includes the earning of Mora (Server digital currency), a Vision, farming for weapons and upgrades with continuously expanding systems related to each. Mora can be redeemed to make use of several server functions, including redemption for Official Merchandise. Genshin Impact Tavern is also the proud host of the Cat\'s Tail Gathering TCG Tournament! _Genshin Impact Tavern is an officially endorsed server._'
  },

  element_icons: {
    Pyro: '<:pyro:977274232444686366>',
    Hydro: '<:hydro:977274232520183918>',
    Anemo: '<:anemo:977274485835198494>',
    Electro: '<:electro:977274232419536906>',
    Dendro: '<:dendro:977274231740059730>',
    Cryo: '<:cryo:977274232461479976>',
    Geo: '<:geo:977274232356622386>',
    Other: '<:other:977277466680909904>',
  },

  weapon_icons: {
    Bow: '<:bow:1074671588781330493>',
    Catalyst: '<:catalyst:1074671586491256923>',
    Claymore: '<:claymore:1074671582385012746>',
    Polearm: '<:polearm:1074671579310596166>',
    Sword: '<:sword:1074671584813518870>',
    Other: ':question:',
  },

  old: {
    split_by: 'name[0]',
    split_count: 3,

    category: {
      order_by: 'split',
      order: 'ascending',
      format: '#-{ first.name[0] }{ first.name[1] } - { last.name[0] }{ last.name[1] }',
      align: true,
    },
    
    item: {
      order_by: 'name',
      order: 'ascending',
      format: '- { link }',
    },
  },

  default: {
    split_by: 'element',

    category: {
      order_by: ['size', 'split'],
      order: ['descending', 'ascending'],
      format: '#-{ element_icons[first.element] }',
      align: true,
    },

    item: {
      order_by: 'name',
      order: 'ascending',
      format: '- { link }',
    },
  },
}