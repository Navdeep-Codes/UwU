const fs = require('fs');
const path = require('path');

const userPath = path.join(__dirname, '../../database/users.json');
const animalPath = path.join(__dirname, '../../database/users.json');
const shop = require('../../data/shop.json');

function loadJSON(p) {
  return fs.existsSync(p) ? JSON.parse(fs.readFileSync(p)) : {};
}

module.exports = {
  name: "inv",
  run: async ({ user, say }) => {
    const users = loadJSON(userPath);
    const animals = loadJSON(animalPath);
    const data = users[user];
    const zoo = animals[user];

    if (!data && !zoo) return say("You have no inventory yet!");

    let msg = `*<@${user}>'s Inventory*\n`;

    const items = data?.inventory || {};
    if (Object.keys(items).length > 0) {
      msg += `\n*Items:*\n`;
      for (const [id, count] of Object.entries(items)) {
        const item = shop.find(i => i.id === id);
        msg += `> ${item?.emoji || '📦'} ${item?.name || id} ×${count}\n`;
      }
    } else {
      msg += `\n*Items:* _none_\n`;
    }

    const animalList = zoo?.animals || [];
    if (animalList.length > 0) {
      msg += `\n*Animals Collected:*\n`;
      for (const animal of animalList) {
        msg += `> ${animal.emoji || '🐾'} ${animal.name} — Atk: ${animal.attack}, Def: ${animal.defense}\n`;
      }
    } else {
      msg += `\n*Animals:* _none_\n`;
    }

    if (zoo?.companion) {
      const c = zoo.companion;
      msg += `\n*Companion Equipped:* ${c.emoji || '✨'} ${c.name} — Atk: ${c.attack}, Def: ${c.defense}, HP: ${c.hp}\n`;
    }

    return say(msg);
  }
};
