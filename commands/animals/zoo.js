const fs = require('fs');
const path = require('path');

const userDBPath = path.join(__dirname, '../../database/users.json');
const userDB = JSON.parse(fs.readFileSync(userDBPath));

module.exports = {
  name: "zoo",
  run: async ({ user, say }) => {
    const id = user;

    if (!userDB[id] || !userDB[id].animals || userDB[id].animals.length === 0) {
      return await say("🦴 Your zoo is empty! Use `!U hunt` to find animals.");
    }

    // Group animals
    const countMap = {};
    for (const a of userDB[id].animals) {
      const key = `${a.emoji} ${a.name}`;
      countMap[key] = (countMap[key] || 0) + 1;
    }

    const sorted = Object.entries(countMap)
      .sort((a, b) => b[1] - a[1]) 
      .slice(0, 15); 

    const zooText = sorted
      .map(([key, count]) => `${key} ${count > 1 ? `×${count}` : ''}`)
      .join('\n');

    await say(`Your Zoo Collection:\n${zooText}`);
  }
};
