const fs = require('fs');
const path = require('path');
const shop = require('../../data/shop.json');
const userPath = path.join(__dirname, '../../database/users.json');
const animalPath = path.join(__dirname, '../../database/animals.json');

function loadJSON(p) {
  if (!fs.existsSync(p)) return {};
  return JSON.parse(fs.readFileSync(p));
}

module.exports = {
  name: "inv",
  run: async ({ user, say }) => {
    const users = loadJSON(userPath);
    const animals = loadJSON(animalPath);
    const shopItems = shop;

    const u = users[user];
    if (!u) return say("❌ You don't have any inventory yet.");

    const inv = u.inventory || {};
    const animalInv = animals[user] || {};

    let inventoryMsg = `🎒 *Inventory for <@${user}>*\n`;

    if (u.equipped) {
      const equipped = shopItems.find(i => i.id === u.equipped);
      if (equipped) {
        inventoryMsg += `🛡 Equipped: ${equipped.emoji} *${equipped.name}*\n`;
      }
    }

    if (Object.keys(inv).length > 0) {
      inventoryMsg += `\n🧪 *Battle Items:*\n`;
      for (const id in inv) {
        const item = shopItems.find(i => i.id === id);
        if (item) {
          inventoryMsg += `• ${item.emoji} *${item.name}* ×${inv[id]}\n`;
        }
      }
    }

    if (Object.keys(animalInv).length > 0) {
      inventoryMsg += `\n🦁 *Animals:*\n`;
      for (const a in animalInv) {
        inventoryMsg += `• ${animalInv[a].emoji || "🐾"} *${animalInv[a].name}* ×${animalInv[a].x}\n`;
      }
    }

    if (inventoryMsg.trim() === `🎒 *Inventory for <@${user}>*`) {
      return say("❌ You don’t own anything yet.");
    }

    return say(inventoryMsg);
  }
};
