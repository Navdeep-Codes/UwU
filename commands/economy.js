const User = require('../models/user');
const Shop = require('../models/shop');
const { getUserMention, formatCurrency, parseBetAmount } = require('../utils/helpers');

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
const economyCommands = {
  handleBalance: async ({ message, say }) => {
    const userId = message.user;
    const username = await getUserMention(userId);
    const user = await getOrCreateUser(userId, username);
    
    await say({
      blocks: [
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: `*${username}'s Balance*`
          }
        },
        {
          type: "section",
          fields: [
            {
              type: "mrkdwn",
              text: `*Wallet:* $${user.wallet.toLocaleString()}`
            },
            {
              type: "mrkdwn",
              text: `*Bank:* $${user.bank.toLocaleString()}`
            },
            {
              type: "mrkdwn",
              text: `*Total:* $${(user.wallet + user.bank).toLocaleString()}`
            }
          ]
        }
      ]
    });
  },
}
module.exports = {
  
  handleBeg: async ({ message, say }) => {
    const userId = message.user;
    const username = await getUserMention(userId);
    const user = await getOrCreateUser(userId, username);
    
    const now = new Date();
    const begCooldown = 5 * 60 * 1000; 
    
    if (user.lastBeg && now - user.lastBeg < begCooldown) {
      const timeLeft = begCooldown - (now - user.lastBeg);
      const minutesLeft = Math.floor(timeLeft / (60 * 1000));
      const secondsLeft = Math.floor((timeLeft % (60 * 1000)) / 1000);
      
      return say(`Slow down, ${username}! You can beg again in ${minutesLeft}m ${secondsLeft}s.`);
    }
    
    const success = Math.random() < 0.7; 
    
    if (success) {
      const minAmount = 1;
      const maxAmount = 50;
      const earnings = Math.floor(Math.random() * (maxAmount - minAmount + 1)) + minAmount;
      
      user.wallet += earnings;
      
      const successMessages = [
        `Someone took pity on ${username} and gave them $${earnings}.`,
        `${username} found $${earnings} on the ground while begging.`,
        `Someone felt generous and tossed ${username} $${earnings}.`,
        `${username} put on such a sad face that someone gave them $${earnings}.`,
        `${username}'s begging was so pathetic that it earned them $${earnings}.`
      ];
      
      const randomMessage = successMessages[Math.floor(Math.random() * successMessages.length)];
      await say(randomMessage);
    } else {
      const failMessages = [
        `${username} begged, but everyone ignored them.`,
        `${username} tried begging, but only received judgmental stares.`,
        `${username} asked for money, but someone just gave them life advice instead.`,
        `${username} held out their hand, but people just high-fived them and walked away.`,
        `${username} begged for money but got offered a job application instead.`
      ];
      
      const randomMessage = failMessages[Math.floor(Math.random() * failMessages.length)];
      await say(randomMessage);
    }
    
    user.lastBeg = now;
    await user.save();
  },
  
  handleDeposit: async ({ message, say, args }) => {
    const userId = message.user;
    const username = await getUserMention(userId);
    const user = await getOrCreateUser(userId, username);
    
    if (!args || !args.length) {
      return say(`Please specify an amount to deposit. Example: \`!UwU deposit 100\` or \`!UwU deposit all\``);
    }
    
    let amount;
    if (args[0].toLowerCase() === 'all') {
      amount = user.wallet;
    } else if (args[0].toLowerCase() === 'half') {
      amount = Math.floor(user.wallet / 2);
    } else {
      amount = parseInt(args[0]);
    }
    
    if (isNaN(amount) || amount <= 0) {
      return say(`${username}, please enter a valid amount.`);
    }
    
    if (amount > user.wallet) {
      return say(`${username}, you only have $${user.wallet.toLocaleString()} in your wallet.`);
    }
    
    user.wallet -= amount;
    user.bank += amount;
    await user.save();
    
    await say(`${username} deposited $${amount.toLocaleString()} into their bank. Wallet: $${user.wallet.toLocaleString()} | Bank: $${user.bank.toLocaleString()}`);
  },
  
  handleWithdraw: async ({ message, say, args }) => {
    const userId = message.user;
    const username = await getUserMention(userId);
    const user = await getOrCreateUser(userId, username);
    
    if (!args || !args.length) {
      return say(`Please specify an amount to withdraw. Example: \`!UwU withdraw 100\` or \`!UwU withdraw all\``);
    }
    
    let amount;
    if (args[0].toLowerCase() === 'all') {
      amount = user.bank;
    } else if (args[0].toLowerCase() === 'half') {
      amount = Math.floor(user.bank / 2);
    } else {
      amount = parseInt(args[0]);
    }
    
    if (isNaN(amount) || amount <= 0) {
      return say(`${username}, please enter a valid amount.`);
    }
    
    if (amount > user.bank) {
      return say(`${username}, you only have $${user.bank.toLocaleString()} in your bank.`);
    }
    
    user.bank -= amount;
    user.wallet += amount;
    await user.save();
    
    await say(`${username} withdrew $${amount.toLocaleString()} from their bank. Wallet: $${user.wallet.toLocaleString()} | Bank: $${user.bank.toLocaleString()}`);
  },
  
  handleRob: async ({ message, say, args }) => {
    if (!args || !args.length) {
      return say(`Please specify someone to rob. Example: \`!UwU rob @user\``);
    }
    
    const userId = message.user;
    const username = await getUserMention(userId);
    const user = await getOrCreateUser(userId, username);
    
    const now = new Date();
    const robCooldown = 30 * 60 * 1000; 
    
    if (user.lastRob && now - user.lastRob < robCooldown) {
      const timeLeft = robCooldown - (now - user.lastRob);
      const minutesLeft = Math.floor(timeLeft / (60 * 1000));
      const secondsLeft = Math.floor((timeLeft % (60 * 1000)) / 1000);
      
      return say(`${username}, you need to lay low for a while. You can rob again in ${minutesLeft}m ${secondsLeft}s.`);
    }
    
    const targetId = args[0].replace(/[<@>]/g, '');
    
    if (targetId === userId) {
      return say(`${username}, you can't rob yourself. That's just moving money from one pocket to another.`);
    }
    
    const targetUser = await User.findOne({ userId: targetId });
    const targetUsername = await getUserMention(targetId);
    
    if (!targetUser || targetUser.wallet <= 0) {
      user.lastRob = now;
      await user.save();
      return say(`${username} tried to rob ${targetUsername}, but they're broke! You wasted your robbery cooldown.`);
    }
    
    const minWalletForRob = 100;
    if (user.wallet < minWalletForRob) {
      return say(`${username}, you need at least $${minWalletForRob} in your wallet to attempt a robbery. It's the cost of tools.`);
    }
    
    const successRate = 0.4; 
    const success = Math.random() < successRate;
    
    user.lastRob = now;
    
    if (success) {
      const percentToRob = Math.random() * 0.2 + 0.1; // 0.1 to 0.3
      const amountStolen = Math.floor(targetUser.wallet * percentToRob);
      
      targetUser.wallet -= amountStolen;
      user.wallet += amountStolen;
      
      await user.save();
      await targetUser.save();
      
      await say(`${username} successfully robbed ${targetUsername} and got away with $${amountStolen.toLocaleString()}! Run!`);
    } else {
      const fine = Math.floor(user.wallet * 0.3); 
      user.wallet -= fine;
      
      await user.save();
      
      await say(`${username} tried to rob ${targetUsername}, but got caught! You were fined $${fine.toLocaleString()}.`);
    }
  },
  
  handleInventory: async ({ message, say }) => {
    const userId = message.user;
    const username = await getUserMention(userId);
    const user = await getOrCreateUser(userId, username);
    
    if (!user.inventory || user.inventory.length === 0) {
      return say(`${username}, your inventory is empty. Visit the shop to buy items!`);
    }
    
    const groupedInventory = user.inventory.reduce((acc, item) => {
      if (!acc[item.type]) {
        acc[item.type] = [];
      }
      acc[item.type].push(item);
      return acc;
    }, {});
    
    const blocks = [
      {
        type: "header",
        text: {
          type: "plain_text",
          text: `${username.replace(/[<@>]/g, '')}'s Inventory`,
          emoji: true
        }
      }
    ];
    
    for (const [type, items] of Object.entries(groupedInventory)) {
      blocks.push({
        type: "section",
        text: {
          type: "mrkdwn",
          text: `*${type.charAt(0).toUpperCase() + type.slice(1)}s:*`
        }
      });
      
      const itemsList = items.map(item => {
        return `• ${item.name} (${item.quantity}x) - ${item.description}`;
      }).join('\n');
      
      blocks.push({
        type: "section",
        text: {
          type: "mrkdwn",
          text: itemsList
        }
      });
    }
    
    await say({ blocks });
  },
  
  handleShop: async ({ message, say }) => {
    const userId = message.user;
    const username = await getUserMention(userId);
    const user = await getOrCreateUser(userId, username);
    
    const shopItems = await Shop.find().sort({ price: 1 });
    
    if (!shopItems || shopItems.length === 0) {
      return say(`The shop is currently empty. Check back later!`);
    }
    
    const groupedItems = shopItems.reduce((acc, item) => {
      if (!acc[item.type]) {
        acc[item.type] = [];
      }
      acc[item.type].push(item);
      return acc;
    }, {});
    
    const blocks = [
      {
        type: "header",
        text: {
          type: "plain_text",
          text: "Shop Items",
          emoji: true
        }
      },
      {
        type: "context",
        elements: [
          {
            type: "mrkdwn",
            text: `Your wallet: $${user.wallet.toLocaleString()}`
          }
        ]
      }
    ];
    
    for (const [type, items] of Object.entries(groupedItems)) {
      blocks.push({
        type: "section",
        text: {
          type: "mrkdwn",
          text: `*${type.charAt(0).toUpperCase() + type.slice(1)}s:*`
        }
      });
      
      // Add each item in this type
      const itemsList = items.map(item => {
        return `• ${item.name} - $${item.price.toLocaleString()} - ${item.description}`;
      }).join('\n');
      
      blocks.push({
        type: "section",
        text: {
          type: "mrkdwn",
          text: itemsList
        }
      });
    }
    
    blocks.push({
      type: "context",
      elements: [
        {
          type: "mrkdwn",
          text: "Use `!UwU buy <item name>` to purchase an item."
        }
      ]
    });
    
    await say({ blocks });
  },
  
  handleBuy: async ({ message, say, args }) => {
    if (!args || !args.length) {
      return say(`Please specify an item to buy. Example: \`!UwU buy Fishing Rod\``);
    }
    
    const userId = message.user;
    const username = await getUserMention(userId);
    const user = await getOrCreateUser(userId, username);
    
    const itemName = args.join(' ');
    const item = await Shop.findOne({ 
      name: { $regex: new RegExp(itemName, 'i') } 
    });
    
    if (!item) {
      return say(`${username}, I couldn't find an item called "${itemName}" in the shop.`);
    }
    
    if (user.wallet < item.price) {
      return say(`${username}, you don't have enough money to buy ${item.name}. It costs $${item.price.toLocaleString()}, but you only have $${user.wallet.toLocaleString()}.`);
    }
    
    const existingItem = user.inventory.find(i => i.itemId === item.itemId);
    
    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      user.inventory.push({
        itemId: item.itemId,
        name: item.name,
        description: item.description,
        quantity: 1,
        type: item.type
      });
    }
    
    user.wallet -= item.price;
    await user.save();
    
    await say(`${username} bought ${item.name} for $${item.price.toLocaleString()}. Your wallet: $${user.wallet.toLocaleString()}`);
  },
  
  handleSell: async ({ message, say, args }) => {
    if (!args || !args.length) {
      return say(`Please specify an item to sell. Example: \`!UwU sell Fishing Rod\``);
    }
    
    const userId = message.user;
    const username = await getUserMention(userId);
    const user = await getOrCreateUser(userId, username);
    
    const itemName = args.join(' ');
    const inventoryItem = user.inventory.find(item => 
      item.name.toLowerCase() === itemName.toLowerCase()
    );
    
    if (!inventoryItem) {
      return say(`${username}, you don't have an item called "${itemName}" in your inventory.`);
    }
    
    const shopItem = await Shop.findOne({ itemId: inventoryItem.itemId });
    
    if (!shopItem || !shopItem.sellable) {
      return say(`${username}, this item cannot be sold.`);
    }
    
    if (inventoryItem.quantity > 1) {
      inventoryItem.quantity -= 1;
    } else {
      user.inventory = user.inventory.filter(item => item.itemId !== inventoryItem.itemId);
    }
    
    user.wallet += shopItem.sellPrice;
    
    await user.save();
    
    await say(`${username} sold ${shopItem.name} for $${shopItem.sellPrice.toLocaleString()}. Your wallet: $${user.wallet.toLocaleString()}`);
  },
  
  handleGive: async ({ message, say, args }) => {
    if (!args || args.length < 2) {
      return say(`Please specify a user and amount. Example: \`!UwU give @user 100\``);
    }
    
    const userId = message.user;
    const username = await getUserMention(userId);
    const user = await getOrCreateUser(userId, username);
    
    const targetId = args[0].replace(/[<@>]/g, '');
    
    if (targetId === userId) {
      return say(`${username}, you can't give money to yourself.`);
    }
    
    const amount = parseInt(args[1]);
    
    if (isNaN(amount) || amount <= 0) {
      return say(`${username}, please enter a valid amount.`);
    }
    
    if (amount > user.wallet) {
      return say(`${username}, you don't have enough money. Your wallet: $${user.wallet.toLocaleString()}`);
    }
    
    const targetUsername = await getUserMention(targetId);
    let target = await User.findOne({ userId: targetId });
    
    if (!target) {
      target = new User({
        userId: targetId,
        username: targetUsername,
        wallet: 0,
        bank: 0
      });
    }
    
    user.wallet -= amount;
    target.wallet += amount;
    
    await user.save();
    await target.save();
    
    await say(`${username} gave $${amount.toLocaleString()} to ${targetUsername}. How generous!`);
  },
  
  handleLeaderboard: async ({ message, say }) => {
    const userId = message.user;
    const username = await getUserMention(userId);
    
    const topUsers = await User.aggregate([
      {
        $addFields: {
          totalWealth: { $add: ["$wallet", "$bank"] }
        }
      },
      {
        $sort: { totalWealth: -1 }
      },
      {
        $limit: 10
      }
    ]);
    
    if (!topUsers || topUsers.length === 0) {
      return say(`No users found in the economy system yet.`);
    }
    
    const leaderboardText = await Promise.all(topUsers.map(async (user, index) => {
      const userMention = await getUserMention(user.userId);
      return `${index + 1}. ${userMention} - $${user.totalWealth.toLocaleString()} (Wallet: $${user.wallet.toLocaleString()} | Bank: $${user.bank.toLocaleString()})`;
    }));
    
    await say({
      blocks: [
        {
          type: "header",
          text: {
            type: "plain_text",
            text: "💰 Wealthiest Users 💰",
            emoji: true
          }
        },
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: leaderboardText.join('\n')
          }
        }
      ]
    });
  }
};

module.exports = economyCommands;