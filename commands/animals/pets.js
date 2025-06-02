const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, '../../database/users.json');
const userDB = JSON.parse(fs.readFileSync(dbPath));

module.exports = {
  name: "pets",
  run: async ({ user, say }) => {
    const data = userDB[user];

    if (!data || !data.equipped) {
      return await say("❌ You don't have a pet equipped! Use `!U equip [animal name]` to set one.");
    }

    const pet = data.equipped;

    await say(`🐾 Your current companion is: ${pet.emoji} *${pet.name}* (${pet.rarity})\n💰 Value: ${pet.value} doubloons`);
  }
};
