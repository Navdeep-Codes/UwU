const fs = require('fs');
const path = require('path');
const shop = require('../../data/shop.json');

module.exports = {
  name: "shop",
  run: async ({ say }) => {
    let msg = `🛍️ *Battle Item Shop*\n\nThese items can be used in battles. Buy them with doubloons!\n`;

    shop.forEach(item => {
      msg += `\n${item.emoji} *${item.name}* — :doubloon: ${item.price} doubloons\n_${item.description}_\n`;
    });

    msg += `\nUse \`!U buy [item name]\` to purchase.`;

    await say(msg);
  }
};
