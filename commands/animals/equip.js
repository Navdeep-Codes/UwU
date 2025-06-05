const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, '../../database/users.json');
const userDB = JSON.parse(fs.readFileSync(dbPath));

function save() {
  fs.writeFileSync(dbPath, JSON.stringify(userDB, null, 2));
}

module.exports = {
  name: "equip",
  run: async ({ user, args, say }) => {
    const id = user;
    const animals = userDB[id]?.animals || [];

    if (!args.length) {
      return await say("⚠️ Usage: `!U equip [animal name]`");
    }

    const query = args.join(" ").toLowerCase();
    const match = animals.find(a => a.name.toLowerCase() === query);

    if (!match) {
      return await say("You don't have that animal.");
    }

    userDB[id].equipped = match;
    save();

    await say(`Equipped ${match.emoji} *${match.name}* as your main companion!`);
  }
};
