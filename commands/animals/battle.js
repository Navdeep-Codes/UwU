const fs = require('fs');
const path = require('path');

const animalPath = path.join(__dirname, '../../database/animals.json');
const userPath = path.join(__dirname, '../../database/users.json');
const shop = require('../../data/shop.json');

function loadJSON(p) {
  if (!fs.existsSync(p)) return {};
  return JSON.parse(fs.readFileSync(p));
}

function saveJSON(p, data) {
  fs.writeFileSync(p, JSON.stringify(data, null, 2));
}

function getItemBonus(equipId) {
  const item = shop.find(i => i.id === equipId);
  if (!item) return 0;
  return Math.floor(Math.random() * (item.max_dmg - item.min_dmg + 1)) + item.min_dmg;
}

module.exports = {
  name: "battle",
  run: async ({ user, args, say }) => {
    if (!args.length) return say("❌ Mention a user to battle. Example: `!U battle @user`");

    const match = args[0].match(/^<@(\w+)>$/);
    if (!match) return say("❌ Invalid user mention.");
    const opponent = match[1];
    if (opponent === user) return say("❌ You can't battle yourself.");

    const users = loadJSON(userPath);
    const animals = loadJSON(animalPath);

    if (!users[user] || !users[opponent]) return say("❌ Both players must exist.");
    if (!animals[user]?.companion || !animals[opponent]?.companion)
      return say("❌ Both players must have a companion animal to battle.");

    const p1 = {
      id: user,
      profile: users[user],
      animal: animals[user].companion,
      item: shop.find(i => i.id === users[user].equipped)
    };

    const p2 = {
      id: opponent,
      profile: users[opponent],
      animal: animals[opponent].companion,
      item: shop.find(i => i.id === users[opponent].equipped)
    };

    let hp1 = p1.animal.hp;
    let hp2 = p2.animal.hp;

    const log = [`🐾 *${p1.animal.emoji} ${p1.animal.name}* vs *${p2.animal.emoji} ${p2.animal.name}*`];

    let round = 1;
    while (hp1 > 0 && hp2 > 0) {
      const p1Bonus = getItemBonus(p1.item?.id || '');
      const p2Bonus = getItemBonus(p2.item?.id || '');

      const p1Dmg = Math.max(1, p1.animal.attack + p1Bonus - p2.animal.defense);
      const p2Dmg = Math.max(1, p2.animal.attack + p2Bonus - p1.animal.defense);

      hp2 -= p1Dmg;
      hp1 -= p2Dmg;

      log.push(`*Round ${round}*`);
      log.push(`> ${p1.animal.emoji} dealt ${p1Dmg} dmg | ${p2.animal.name}: ${Math.max(hp2, 0)} HP`);
      log.push(`> ${p2.animal.emoji} dealt ${p2Dmg} dmg | ${p1.animal.name}: ${Math.max(hp1, 0)} HP`);
      round++;
    }

    let winner = null;

    if (hp1 <= 0 && hp2 <= 0) {
      log.push("⚔️ It's a draw! Both animals fainted.");
    } else if (hp1 > hp2) {
      winner = p1;
    } else {
      winner = p2;
    }

    if (winner) {
      log.push(`🏆 <@${winner.id}>'s ${winner.animal.name} wins! +25 doubloons`);
      winner.profile.doubloons = (winner.profile.doubloons || 0) + 25;
      saveJSON(userPath, users);
    }

    return say(log.join('\n'));
  }
};
