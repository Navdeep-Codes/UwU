const fs = require('fs');
const path = require('path');

const shop = require('../../data/shop.json');
const userPath = path.join(__dirname, '../../database/users.json');

function loadUserDB() {
  if (!fs.existsSync(userPath)) return {};
  return JSON.parse(fs.readFileSync(userPath));
}

function saveUserDB(data) {
  fs.writeFileSync(userPath, JSON.stringify(data, null, 2));
}

module.exports = {
  name: "buy",
  run: async ({ user, args, say }) => {
    if (!args.length) return say("❌ You must specify an item name. Example: `!U buy health potion`");

    const itemName = args.join(" ").toLowerCase();
    const item = shop.find(i => i.name.toLowerCase() === itemName);

    if (!item) return say("❌ That item doesn't exist in the shop!");

    const userDB = loadUserDB();


    const userData = userDB[user];

    // Init inventory if it's undefined
    if (!userData.inventory) {
      userData.inventory = {};
    }

    // Check doubloons
    if (userData.coins < item.price) {
      return say(`❌ You need ${item.price} doubloons to buy ${item.name}, but you only have ${userData.coins}.`);
    }

    // Buy logic
    userData.coins -= item.price;
    userData.inventory[item.id] = (userData.inventory[item.id] || 0) + 1;

    saveUserDB(userDB);

    await say(`✅ You bought 1 ${item.emoji} *${item.name}*! Remaining balance: :doubloons: ${userData.coins} (Undefined=0) doubloons.`);
  }
};

