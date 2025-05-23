const User = require('../models/user');
const { getUserMention } = require('../utils/helpers');

// Helper function to ensure user exists in database
async function getOrCreateUser(userId, username) {
  let user = await User.findOne({ userId });
  
  if (!user) {
    user = new User({
      userId,
      username,
      wallet: 500,
      bank: 0
    });
    await user.save();
  }
  
  return user;
}

// Helper to check if user has an item
function hasItem(user, itemId) {
  return user.inventory.some(item => item.itemId === itemId && item.quantity > 0);
}

module.exports = {
  handleFish: async ({ message, say }) => {
    const userId = message.user;
    const username = await getUserMention(userId);
    const user = await getOrCreateUser(userId, username);
    
    // Check if user has fishing rod
    if (!hasItem(user, 'fishing_rod')) {
      return say(`${username}, you need a Fishing Rod to fish. Buy one from the shop!`);
    }
    
    const now = new Date();
    const fishingCooldown = 20 * 60 * 1000; // 20 minutes
    const lastFishing = user.lastFishing || new Date(0);
    
    if (now - lastFishing < fishingCooldown) {
      const timeLeft = fishingCooldown - (now - lastFishing);
      const minutesLeft = Math.floor(timeLeft / (60 * 1000));
      const secondsLeft = Math.floor((timeLeft % (60 * 1000)) / 1000);
      
      return say(`${username}, you need to wait before fishing again. Try in ${minutesLeft}m ${secondsLeft}s.`);
    }
    
    // Check for boosters
    const activeBooster = user.activeBoosts?.find(boost => boost.stat === 'work');
    let multiplier = activeBooster ? activeBooster.multiplier : 1;
    
    // Check for VIP badge
    if (hasItem(user, 'vip_badge')) {
      multiplier *= 1.05;
    }
    
    // Calculate fishing reward
    const minReward = 50;
    const maxReward = 200;
    let baseReward = Math.floor(Math.random() * (maxReward - minReward + 1)) + minReward;
    const reward = Math.floor(baseReward * multiplier);
    
    // Fishing results
    const fishTypes = [
      'a tiny minnow', 'a decent trout', 'a large bass', 'a massive catfish', 
      'an old boot (still worth something)', 'a golden fish', 'a rare tropical fish',
      'a rusty can with coins inside', 'a fishing hook with money attached'
    ];
    
    const caughtFish = fishTypes[Math.floor(Math.random() * fishTypes.length)];
    
    // Update user
    user.wallet += reward;
    user.lastFishing = now;
    await user.save();
    
    await say(`${username} cast their line and caught ${caughtFish} worth $${reward.toLocaleString()}! Your wallet: $${user.wallet.toLocaleString()}`);
  },
  
  handleHunt: async ({ message, say }) => {
    const userId = message.user;
    const username = await getUserMention(userId);
    const user = await getOrCreateUser(userId, username);
    
    // Check if user has hunting rifle
    if (!hasItem(user, 'hunting_rifle')) {
      return say(`${username}, you need a Hunting Rifle to hunt. Buy one from the shop!`);
    }
    
    const now = new Date();
    const huntingCooldown = 30 * 60 * 1000; // 30 minutes
    const lastHunting = user.lastHunting || new Date(0);
    
    if (now - lastHunting < huntingCooldown) {
      const timeLeft = huntingCooldown - (now - lastHunting);
      const minutesLeft = Math.floor(timeLeft / (60 * 1000));
      const secondsLeft = Math.floor((timeLeft % (60 * 1000)) / 1000);
      
      return say(`${username}, you need to wait before hunting again. Try in ${minutesLeft}m ${secondsLeft}s.`);
    }
    
    // Check for boosters
    const activeBooster = user.activeBoosts?.find(boost => boost.stat === 'work');
    let multiplier = activeBooster ? activeBooster.multiplier : 1;
    
    // Check for VIP badge
    if (hasItem(user, 'vip_badge')) {
      multiplier *= 1.05;
    }
    
    // Calculate hunting reward
    const minReward = 100;
    const maxReward = 500;
    let baseReward = Math.floor(Math.random() * (maxReward - minReward + 1)) + minReward;
    const reward = Math.floor(baseReward * multiplier);
    
    // Hunting results
    const animalTypes = [
      'a rabbit', 'a deer', 'a wild boar', 'a fox', 
      'a rare white stag', 'a bear', 'a mountain lion',
      'a pheasant', 'a flock of geese'
    ];
    
    const caughtAnimal = animalTypes[Math.floor(Math.random() * animalTypes.length)];
    
    // Update user
    user.wallet += reward;
    user.lastHunting = now;
    await user.save();
    
    await say(`${username} went hunting and caught ${caughtAnimal} worth $${reward.toLocaleString()}! Your wallet: $${user.wallet.toLocaleString()}`);
  },
  
  handleDig: async ({ message, say }) => {
    const userId = message.user;
    const username = await getUserMention(userId);
    const user = await getOrCreateUser(userId, username);
    
    // Check if user has shovel
    if (!hasItem(user, 'shovel')) {
      return say(`${username}, you need a Shovel to dig. Buy one from the shop!`);
    }
    
    const now = new Date();
    const digCooldown = 45 * 60 * 1000; // 45 minutes
    const lastDig = user.lastDig || new Date(0);
    
    if (now - lastDig < digCooldown) {
      const timeLeft = digCooldown - (now - lastDig);
      const minutesLeft = Math.floor(timeLeft / (60 * 1000));
      const secondsLeft = Math.floor((timeLeft % (60 * 1000)) / 1000);
      
      return say(`${username}, you need to wait before digging again. Try in ${minutesLeft}m ${secondsLeft}s.`);
    }
    
    // High risk, high reward
    const foundTreasure = Math.random() < 0.4; // 40% chance
    
    if (foundTreasure) {
      // Check for boosters
      const activeBooster = user.activeBoosts?.find(boost => boost.stat === 'work');
      let multiplier = activeBooster ? activeBooster.multiplier : 1;
      
      // Check for VIP badge
      if (hasItem(user, 'vip_badge')) {
        multiplier *= 1.05;
      }
      
      const minReward = 200;
      const maxReward = 1000;
      let baseReward = Math.floor(Math.random() * (maxReward - minReward + 1)) + minReward;
      const reward = Math.floor(baseReward * multiplier);
      
      // Treasure results
      const treasureTypes = [
        'an ancient coin collection', 'a buried treasure chest', 'a bag of jewels', 
        'a historical artifact', 'a golden statue', 'a rare gemstone',
        'a wealthy person\'s lost wallet', 'an antique worth money'
      ];
      
      const foundItem = treasureTypes[Math.floor(Math.random() * treasureTypes.length)];
      
      // Update user
      user.wallet += reward;
      user.lastDig = now;
      await user.save();
      
      await say(`${username} dug deep and found ${foundItem} worth $${reward.toLocaleString()}! Your wallet: $${user.wallet.toLocaleString()}`);
    } else {
      // Found nothing
      user.lastDig = now;
      await user.save();
      
      const failMessages = [
        'dug for hours but found nothing but dirt',
        'hit a rock and bent their shovel, finding nothing of value',
        'accidentally dug into a sprinkler pipe - no treasure here!',
        'found some interesting worms, but no treasure',
        'dug up an old shoe, but it wasn\'t even worth keeping'
      ];
      
      const failMessage = failMessages[Math.floor(Math.random() * failMessages.length)];
      
      await say(`${username} ${failMessage}. Better luck next time!`);
    }
  }
};