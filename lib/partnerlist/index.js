import DME from 'discord-markdown-embeds';
import fs from 'fs/promises';
import characters from '../characters.js';
import functions from '../../node_modules/discord-markdown-embeds/functions/index.js';
import _static from './static.js';
import { Element, WeaponType } from '../constants.js';

const sortingOrders = {
  ascending: (a, b) => a > b ? 1 : a < b ? -1 : 0,
  descending: (a, b) => a < b ? 1 : a > b ? -1 : 0,
}


const defaultTemplate = await fs.readFile('lib/partnerlist/default.md', 'utf8');

export default class PartnerLists {
  defaultTemplate = defaultTemplate;
  
  constructor(client) {
    this.client = client;
  }

  async getPartners() {
    const partners = await this.client.tcn.fetchGuilds();

    const characterCounts = partners.reduce((a, v) => {
      a[v.character] ??= 0;
      a[v.character] += 1;
      return v;
    }, {});

    return partners.map(partner => {
      const character = characters[partner.character];
      return {
        id: partner.id,
        name: characterCounts[character.name] > 1 ? partner.name : character.short || character.name,
        character: character.name,
        element: character.element,
        weapon: character.weaponType,
      }
    });
  }

  async get(template, guild) {
    const partners = await this.getPartners();
    const self = partners.find(g => g.id === guild?.id);
    
    return DME.render(template, {
      ..._static,
      self,
      
      partners: ({ __parse: parse, ...DMEOptions }, options = _static.default) => {
        const categories = this.getCategories(partners.filter(partner => (options.self?.include ?? true) || partner.id !== guild?.id), options);
        const sorted = this.sortCategories(categories, options);
        const groups = this.groupCategories(sorted, options);
        groups.forEach(group => this.sortItems(group, options));

        const extendPartner = partner => ({
          ...partner,
          element: Element[partner.element],
          weapon: WeaponType[partner.weapon],
          link: `[${partner.name}](https://discord.gg/${partner.invite})`,
        });
        
        return groups.flatMap(group => {
          const title = parse(options.category.format, { ..._static, items: group, size: group.length, first: extendPartner(group[0]), last: extendPartner(group.at(-1)) }, DMEOptions);
          const items = parse(group.map(partner => DME.renderInline(partner.id === self?.id && options.self?.format || options.item.format, { ..._static, ...extendPartner(partner) })).join('\n'), DMEOptions);
          return title.concat(items);
        }).concat(...options.category.align ? Array.from({ length: (3 - groups.length % 3) % 3 }, () => parse('#-_ _\n_ _')) : []);
      },
    });
  }

  getCategories(partners, options) {
    const categories = {};
    const mapper = functions.parse(functions.tokenize(`{${options.split_by}}`));
    for (const partner of partners) {
      const category = mapper({
        ...partner,
        __parse: undefined,
      });
      categories[category] ??= [];
      categories[category].push(partner);
    }
    return Object.entries(categories);
  }

  groupCategories(categories, options) {
    if (!options.split_count) return categories.map(([,partners]) => partners);
    const groups = [];
    const averageSize = categories.reduce((a, [,v]) => a + v.length, 0) / options.split_count;
    for (const [,partners] of categories) {
      const lastGroup = groups[groups.length - 1];
      if (lastGroup && lastGroup.length + partners.length / 2 - averageSize <= 0) {
        lastGroup.push(...partners);
      } else {
        groups.push(partners);
      }
    }
    return groups;
  }

  sortCategories(categories, options) {
    return categories.sort(([ak, av], [bk, bv]) => {
      const props = Array.isArray(options.category.order_by) ? options.category.order_by : [options.category.order_by];
      const orders = Array.isArray(options.category.order) ? options.category.order : [options.category.order];
      for (const prop of props) {
        const mapper = opts => functions.parse(functions.tokenize(`{${prop}}`))(opts, {});
        const order = orders[props.indexOf(prop) % orders.length];
        const result = sortingOrders[order](mapper({ items: av, size: av.length, split: ak }), mapper({ items: bv, size: bv.length, split: bk }));
        if (result) return result;
      }
    });
  }

  sortItems(items, options) {
    return items.sort((a, b) => {
      const props = Array.isArray(options.item.order_by) ? options.item.order_by : [options.item.order_by];
      const orders = Array.isArray(options.item.order) ? options.item.order : [options.item.order];
      for (const prop of props) {
        const mapper = opts => functions.parse(functions.tokenize(`{${prop}}`))(opts, {});
        const order = orders[props.indexOf(prop) % orders.length];
        const result = sortingOrders[order](mapper({...a }), mapper({ ...b }));
        if (result) return result;
      }
    });
  }
}