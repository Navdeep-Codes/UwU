const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, '../../database/users.json');
const userDB = JSON.parse(fs.readFileSync(dbPath));

function save() {
  fs.writeFileSync(dbPath, JSON.stringify(userDB, null, 2));
}

module.exports = {
  name: "sell",
  run: async ({ user, args, say }) => {
    const id = user;
    const animals = userDB[id]?.animals || [];

    if (!animals.length) {
      return await say("You don't have any animals to sell.");
    }

    let sellTarget = null;

    if (args.length > 0) {
      const query = args.join(" ").toLowerCase();
      sellTarget = animals.find(a => a.name.toLowerCase() === query);
    } else {
      const countMap = {};
      for (const a of animals) {
        const key = `${a.name}`;
        countMap[key] = (countMap[key] || 0) + 1;
      }

      const mostCommon = Object.entries(countMap).sort((a, b) => b[1] - a[1])[0];
      if (mostCommon) {
        sellTarget = animals.find(a => a.name === mostCommon[0]);
      }
    }

    if (!sellTarget) {
      return await say("Couldn't find that animal in your zoo.");
    }

    const index = animals.findIndex(a => a.name === sellTarget.name);
    animals.splice(index, 1);

    const value = sellTarget.value || 10;
    userDB[id].doubloons = (userDB[id].doubloons || 0) + value;

    save();

    await say(`Sold ${sellTarget.emoji} *${sellTarget.name}* for :doubloon: ${value} doubloons!`);
  }
};
