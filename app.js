require('dotenv').config();
const { App } = require('@slack/bolt');
const mongoose = require('mongoose');
const { initializeLottery } = require('./services/lottery');
const { initializeShop } = require('./services/shop');

// Database connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('Connected to MongoDB');
    // Initialize systems after DB connection
    initializeShop();
    initializeLottery();
  })
  .catch(err => console.error('MongoDB connection error:', err));

// Initialize Slack app
const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  socketMode: true,
  appToken: process.env.SLACK_APP_TOKEN
});

// Import command handlers
const economyCommands = require('./commands/economy');
const gamblingCommands = require('./commands/gambling');
const chaosCommands = require('./commands/chaos');
const utilityCommands = require('./commands/utility');
const toolCommands = require('./commands/tools'); // New tools commands

// Set up slash commands
app.command('/dashboard', utilityCommands.handleDashboard);
app.command('/help', utilityCommands.handleHelp);

// Channel restriction middleware for message commands
const restrictToGamblingChannel = async ({ message, next }) => {
  if (message.channel === process.env.GAMBLING_CHANNEL_ID) {
    await next();
  }
};

// Listen for message commands (with !Botname prefix)
app.message(/^!UwU\s+(.+)$/i, restrictToGamblingChannel, async ({ context, message, say }) => {
  const commandText = context.matches[1].trim().toLowerCase();
  const [command, ...args] = commandText.split(' ');

  try {
    // Economy Commands
    if (['balance', 'bal'].includes(command)) await economyCommands.handleBalance({ message, say });
    else if (command === 'daily') await economyCommands.handleDaily({ message, say });
    else if (command === 'weekly') await economyCommands.handleWeekly({ message, say });
    else if (command === 'work') await economyCommands.handleWork({ message, say });
    else if (command === 'beg') await economyCommands.handleBeg({ message, say });
    else if (command === 'deposit') await economyCommands.handleDeposit({ message, say, args });
    else if (command === 'withdraw') await economyCommands.handleWithdraw({ message, say, args });
    else if (command === 'rob') await economyCommands.handleRob({ message, say, args });
    else if (command === 'inventory') await economyCommands.handleInventory({ message, say });
    else if (command === 'shop') await economyCommands.handleShop({ message, say });
    else if (command === 'buy') await economyCommands.handleBuy({ message, say, args });
    else if (command === 'sell') await economyCommands.handleSell({ message, say, args });
    else if (command === 'give') await economyCommands.handleGive({ message, say, args });
    else if (command === 'leaderboard') await economyCommands.handleLeaderboard({ message, say });
    
    // Gambling Commands
    else if (command === 'slots') await gamblingCommands.handleSlots({ message, say, args });
    else if (command === 'blackjack') await gamblingCommands.handleBlackjack({ message, say, args });
    else if (command === 'dice') await gamblingCommands.handleDice({ message, say, args });
    else if (command === 'coinflip') await gamblingCommands.handleCoinflip({ message, say, args });
    else if (command === 'roulette') await gamblingCommands.handleRoulette({ message, say, args });
    else if (command === 'duel') await gamblingCommands.handleDuel({ message, say, args });
    else if (command === 'lottery' && args[0] === 'buy') await gamblingCommands.handleLotteryBuy({ message, say, args: args.slice(1) });
    else if (command === 'lottery' && args[0] === 'pot') await gamblingCommands.handleLotteryPot({ message, say });
    
    // Chaos Commands
    else if (command === 'punch') await chaosCommands.handlePunch({ message, say, args });
    else if (command === 'slap') await chaosCommands.handleSlap({ message, say, args });
    else if (command === 'simp') await chaosCommands.handleSimp({ message, say, args });
    else if (command === 'yeet') await chaosCommands.handleYeet({ message, say, args });
    else if (command === 'roast') await chaosCommands.handleRoast({ message, say, args });
    else if (command === 'meme') await chaosCommands.handleMeme({ message, say });
    
    // Tool Commands
    else if (command === 'fish') await toolCommands.handleFish({ message, say });
    else if (command === 'hunt') await toolCommands.handleHunt({ message, say });
    else if (command === 'dig') await toolCommands.handleDig({ message, say });
    
    // Command not found
    else await say(`Command not found. Try \`!Botname help\` for a list of commands.`);
  } catch (error) {
    console.error(error);
    await say('An error occurred while processing your command.');
  }
});

// Add logic to process booster items
app.message(/^!Botname\s+use\s+(.+)$/i, restrictToGamblingChannel, async ({ context, message, say }) => {
  const userId = message.user;
  const username = await getUserMention(userId);
  const itemName = context.matches[1].trim();
  
  try {
    const user = await User.findOne({ userId });
    if (!user) {
      return say(`${username}, you don't have an account yet. Start playing to create one!`);
    }
    
    // Find the item in user's inventory
    const inventoryItem = user.inventory.find(item => 
      item.name.toLowerCase() === itemName.toLowerCase()
    );
    
    if (!inventoryItem || inventoryItem.quantity <= 0) {
      return say(`${username}, you don't have a "${itemName}" in your inventory.`);
    }
    
    // Get item details from shop
    const shopItem = await Shop.findOne({ itemId: inventoryItem.itemId });
    
    if (!shopItem || shopItem.type !== 'booster') {
      return say(`${username}, this item cannot be used. Only boosters can be activated.`);
    }
    
    // Apply booster effect
    const now = new Date();
    const boostEnd = new Date(now.getTime() + shopItem.effect.duration);
    
    // Remove existing boost of same type if any
    if (!user.activeBoosts) {
      user.activeBoosts = [];
    }
    
    const existingBoostIndex = user.activeBoosts.findIndex(
      boost => boost.stat === shopItem.effect.stat
    );
    
    if (existingBoostIndex !== -1) {
      user.activeBoosts.splice(existingBoostIndex, 1);
    }
    
    // Add new boost
    user.activeBoosts.push({
      itemId: shopItem.itemId,
      name: shopItem.name,
      stat: shopItem.effect.stat,
      multiplier: shopItem.effect.multiplier,
      startTime: now,
      endTime: boostEnd
    });
    
    // Remove item from inventory
    inventoryItem.quantity -= 1;
    if (inventoryItem.quantity <= 0) {
      user.inventory = user.inventory.filter(item => item.itemId !== inventoryItem.itemId);
    }
    
    await user.save();
    
    // Format duration
    const durationHours = shopItem.effect.duration / (60 * 60 * 1000);
    
    await say({
      blocks: [
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: `${username} used a ${shopItem.name}!`
          }
        },
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: `*Effect:* ${shopItem.description}\n*Duration:* ${durationHours} hour${durationHours !== 1 ? 's' : ''}\n*Expires:* ${boostEnd.toLocaleString()}`
          }
        }
      ]
    });
    
  } catch (error) {
    console.error('Error using item:', error);
    await say('An error occurred while trying to use this item.');
  }
});

// Start app
(async () => {
  await app.start(process.env.PORT || 3000);
  console.log('⚡️ Gamble Economy Bot is running!');
})();