const fs = require('fs');
const path = require('path');

// Load animals list
const animals = JSON.parse(fs.readFileSync(path.join(__dirname, '../../data/animals.json')));

// Load or create user data
const userDBPath = path.join(__dirname, '../../database/users.json');
if (!fs.existsSync(userDBPath)) fs.writeFileSync(userDBPath, '{}');

const userDB = JSON.parse(fs.readFileSync(userDBPath));

function getRandomAnimal() {
  // Adjust weights based on rarity
  const weights = {
    Common: 60,
    Uncommon: 25,
    Rare: 10,
    Epic: 4,
    Legendary: 1
  };

  const pool = animals.flatMap(animal =>
    Array(weights[animal.rarity] || 1).fill(animal)
  );

  return pool[Math.floor(Math.random() * pool.length)];
}

module.exports = {
  name: "hunt",
  run: async ({ user, say }) => {
    const id = user;

    const animal = getRandomAnimal();
    const entry = { ...animal, caughtAt: Date.now() };

    if (!userDB[id]) {
      userDB[id] = { animals: [], coins: 0 };
    }

    userDB[id].animals.push(entry);

    fs.writeFileSync(userDBPath, JSON.stringify(userDB, null, 2));

    await say(`You went hunting and found a ${animal.emoji} *${animal.name}*!\nRarity: *${animal.rarity}* • Value: 💰${animal.value}`);
  }
};
