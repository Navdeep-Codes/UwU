const User = require('../models/user');
const Lottery = require('../models/lottery');
const { getUserMention, formatTimeRemaining } = require('../utils/helpers');

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

// Blackjack helper functions
function createDeck() {
  const suits = ['♠️', '♥️', '♦️', '♣️'];
  const values = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
  const deck = [];
  
  for (let suit of suits) {
    for (let value of values) {
      deck.push({ suit, value });
    }
  }
  
  return shuffleDeck(deck);
}

function shuffleDeck(deck) {
  const newDeck = [...deck];
  for (let i = newDeck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newDeck[i], newDeck[j]] = [newDeck[j], newDeck[i]];
  }
  return newDeck;
}

function getCardValue(card) {
  if (['10', 'J', 'Q', 'K'].includes(card.value)) return 10;
  if (card.value === 'A') return 11;
  return parseInt(card.value);
}

function getHandValue(hand) {
  let value = 0;
  let aces = 0;
  
  for (let card of hand) {
    if (card.value === 'A') {
      aces += 1;
      value += 11;
    } else if (['10', 'J', 'Q', 'K'].includes(card.value)) {
      value += 10;
    } else {
      value += parseInt(card.value);
    }
  }
  
  // Adjust for aces
  while (value > 21 && aces > 0) {
    value -= 10;
    aces -= 1;
  }
  
  return value;
}

function formatCard(card) {
  return `${card.value}${card.suit}`;
}

function formatHand(hand) {
  return hand.map(card => formatCard(card)).join(' ');
}

// Roulette helper functions
function getRouletteResult() {
  // 0-36 plus 00 (37)
  return Math.floor(Math.random() * 38);
}

function isRouletteNumberRed(num) {
  const redNumbers = [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36];
  return redNumbers.includes(num);
}

function getRouletteColor(num) {
  if (num === 0 || num === 37) return 'green'; // 0 and 00
  return isRouletteNumberRed(num) ? 'red' : 'black';
}

function formatRouletteNumber(num) {
  if (num === 37) return '00';
  return num.toString();
}

module.exports = {
  // Handle slots command
  handleSlots: async ({ message, say, args }) => {
    const userId = message.user;
    const username = await getUserMention(userId);
    const user = await getOrCreateUser(userId, username);
    
    // Check if bet amount is provided
    if (!args || !args.length) {
      return say(`${username}, you need to specify an amount to bet. Example: \`!Botname slots 100\``);
    }
    
    // Parse bet amount
    let betAmount;
    if (args[0].toLowerCase() === 'all') {
      betAmount = user.wallet;
    } else {
      betAmount = parseInt(args[0]);
    }
    
    // Validate bet amount
    if (isNaN(betAmount) || betAmount <= 0) {
      return say(`${username}, please enter a valid bet amount.`);
    }
    
    if (betAmount > user.wallet) {
      return say(`${username}, you don't have enough money in your wallet. You have $${user.wallet.toLocaleString()}.`);
    }
    
    // Define slots symbols and their multipliers
    const symbols = [
      { symbol: '🍒', value: 1 },
      { symbol: '🍋', value: 1 },
      { symbol: '🍊', value: 2 },
      { symbol: '🍇', value: 2 },
      { symbol: '🍉', value: 3 },
      { symbol: '🍓', value: 3 },
      { symbol: '💎', value: 5 },
      { symbol: '💰', value: 10 },
      { symbol: '🎰', value: 15 }
    ];
    
    // Spin the slots
    const slotResults = [];
    for (let i = 0; i < 3; i++) {
      slotResults.push(symbols[Math.floor(Math.random() * symbols.length)]);
    }
    
    // Determine win/loss
    let multiplier = 0;
    const resultsDisplay = slotResults.map(r => r.symbol).join(' | ');
    
    if (slotResults[0].symbol === slotResults[1].symbol && slotResults[1].symbol === slotResults[2].symbol) {
      // All three match - big win
      multiplier = slotResults[0].value * 3;
    } else if (slotResults[0].symbol === slotResults[1].symbol || slotResults[1].symbol === slotResults[2].symbol) {
      // Two adjacent match - small win
      multiplier = Math.max(
        slotResults[0].symbol === slotResults[1].symbol ? slotResults[0].value : 0,
        slotResults[1].symbol === slotResults[2].symbol ? slotResults[1].value : 0
      );
    }
    
    // Apply multiplier
    const winnings = betAmount * multiplier;
    let resultMessage;
    
    if (multiplier > 0) {
      resultMessage = `You won $${winnings.toLocaleString()}! (${multiplier}x)`;
      user.wallet = user.wallet - betAmount + winnings;
      user.stats.gamesWon += 1;
      user.stats.totalWinnings += winnings;
    } else {
      resultMessage = `You lost $${betAmount.toLocaleString()}. Better luck next time!`;
      user.wallet -= betAmount;
      user.stats.totalLosses += betAmount;
    }
    
    user.stats.gamesPlayed += 1;
    await user.save();
    
    await say({
      blocks: [
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: `*${username}'s Slot Machine*\n\n[ ${resultsDisplay} ]\n\n${resultMessage}\nYour wallet: $${user.wallet.toLocaleString()}`
          }
        }
      ]
    });
  },
  
  handleBlackjack: async ({ message, say, args }) => {
    const userId = message.user;
    const username = await getUserMention(userId);
    const user = await getOrCreateUser(userId, username);
    
    // Check if bet amount is provided
    if (!args || !args.length) {
      return say(`${username}, you need to specify an amount to bet. Example: \`!Botname blackjack 100\``);
    }
    
    // Parse bet amount
    let betAmount;
    if (args[0].toLowerCase() === 'all') {
      betAmount = user.wallet;
    } else {
      betAmount = parseInt(args[0]);
    }
    
    // Validate bet amount
    if (isNaN(betAmount) || betAmount <= 0) {
      return say(`${username}, please enter a valid bet amount.`);
    }
    
    if (betAmount > user.wallet) {
      return say(`${username}, you don't have enough money in your wallet. You have $${user.wallet.toLocaleString()}.`);
    }
    
    // Create a new shuffled deck
    const deck = createDeck();
    
    // Deal initial cards
    const playerHand = [deck.pop(), deck.pop()];
    const dealerHand = [deck.pop(), deck.pop()];
    
    const playerValue = getHandValue(playerHand);
    const dealerValue = getHandValue(dealerHand);
    
    // Format hands for display
    const playerDisplay = formatHand(playerHand);
    const dealerDisplay = `${formatCard(dealerHand[0])} ??`; // Hide one dealer card
    
    // Check for natural blackjack
    if (playerValue === 21 && playerHand.length === 2) {
      // Player has blackjack
      if (dealerValue === 21 && dealerHand.length === 2) {
        // Both have blackjack - push
        await say({
          blocks: [
            {
              type: "section",
              text: {
                type: "mrkdwn",
                text: `*${username}'s Blackjack Game*\n\n`+
                      `Dealer's Hand: ${formatHand(dealerHand)} (${dealerValue})\n`+
                      `Your Hand: ${playerDisplay} (${playerValue})\n\n`+
                      `Both you and the dealer have Blackjack! It's a push.\n`+
                      `Your bet of $${betAmount.toLocaleString()} has been returned to your wallet.`
              }
            }
          ]
        });
      } else {
        // Player wins with blackjack (1.5x payout)
        const winnings = Math.floor(betAmount * 2.5);
        user.wallet += (winnings - betAmount);
        user.stats.gamesWon += 1;
        user.stats.totalWinnings += (winnings - betAmount);
        user.stats.gamesPlayed += 1;
        await user.save();
        
        await say({
          blocks: [
            {
              type: "section",
              text: {
                type: "mrkdwn",
                text: `*${username}'s Blackjack Game*\n\n`+
                      `Dealer's Hand: ${formatHand(dealerHand)} (${dealerValue})\n`+
                      `Your Hand: ${playerDisplay} (${playerValue})\n\n`+
                      `🎉 BLACKJACK! You win $${(winnings - betAmount).toLocaleString()}!\n`+
                      `Your wallet: $${user.wallet.toLocaleString()}`
              }
            }
          ]
        });
      }
      return;
    }
    
    // Dealer has blackjack, player doesn't
    if (dealerValue === 21 && dealerHand.length === 2) {
      user.wallet -= betAmount;
      user.stats.totalLosses += betAmount;
      user.stats.gamesPlayed += 1;
      await user.save();
      
      await say({
        blocks: [
          {
            type: "section",
            text: {
              type: "mrkdwn",
              text: `*${username}'s Blackjack Game*\n\n`+
                    `Dealer's Hand: ${formatHand(dealerHand)} (${dealerValue})\n`+
                    `Your Hand: ${playerDisplay} (${playerValue})\n\n`+
                    `Dealer has Blackjack! You lose $${betAmount.toLocaleString()}.\n`+
                    `Your wallet: $${user.wallet.toLocaleString()}`
            }
          }
        ]
      });
      return;
    }
    
    // Set up interactive game session (simplified version)
    // In a real implementation, you'd use interactive buttons/actions
    await say({
      blocks: [
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: `*${username}'s Blackjack Game*\n\n`+
                  `Dealer's Hand: ${dealerDisplay}\n`+
                  `Your Hand: ${playerDisplay} (${playerValue})\n\n`+
                  `To hit, type \`!Botname hit\`\n`+
                  `To stand, type \`!Botname stand\``
          }
        }
      ]
    });
    
    // In real implementation, you would store the game state and handle the hit/stand commands
    // This demo just shows one round without interaction
  },
  
  // Handle dice command
  handleDice: async ({ message, say, args }) => {
    const userId = message.user;
    const username = await getUserMention(userId);
    const user = await getOrCreateUser(userId, username);
    
    if (!args || !args.length) {
      return say(`${username}, you need to specify an amount to bet. Example: \`!Botname dice 100\``);
    }
    
    let betAmount;
    if (args[0].toLowerCase() === 'all') {
      betAmount = user.wallet;
    } else {
      betAmount = parseInt(args[0]);
    }
    
    if (isNaN(betAmount) || betAmount <= 0) {
      return say(`${username}, please enter a valid bet amount.`);
    }
    
    if (betAmount > user.wallet) {
      return say(`${username}, you don't have enough money in your wallet. You have $${user.wallet.toLocaleString()}.`);
    }
    
    // Roll the dice
    const userRoll = Math.floor(Math.random() * 6) + 1;
    const botRoll = Math.floor(Math.random() * 6) + 1;
    
    let resultMessage;
    user.stats.gamesPlayed += 1;
    
    if (userRoll > botRoll) {
      // User wins
      const winnings = betAmount;
      user.wallet += winnings;
      user.stats.gamesWon += 1;
      user.stats.totalWinnings += winnings;
      resultMessage = `You rolled a ${userRoll} and the bot rolled a ${botRoll}. You win $${winnings.toLocaleString()}!`;
    } else if (userRoll < botRoll) {
      // User loses
      user.wallet -= betAmount;
      user.stats.totalLosses += betAmount;
      resultMessage = `You rolled a ${userRoll} and the bot rolled a ${botRoll}. You lose $${betAmount.toLocaleString()}.`;
    } else {
      // It's a tie
      resultMessage = `You rolled a ${userRoll} and the bot rolled a ${botRoll}. It's a tie! Your bet has been returned.`;
    }
    
    await user.save();
    
    await say({
      blocks: [
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: `*${username}'s Dice Game*\n\n${resultMessage}\nYour wallet: $${user.wallet.toLocaleString()}`
          }
        }
      ]
    });
  },
  
  handleCoinflip: async ({ message, say, args }) => {
    const userId = message.user;
    const username = await getUserMention(userId);
    const user = await getOrCreateUser(userId, username);
    
    if (!args || args.length < 2) {
      return say(`${username}, you need to specify your choice and bet amount. Example: \`!Botname coinflip heads 100\``);
    }
    
    const choice = args[0].toLowerCase();
    if (choice !== 'heads' && choice !== 'tails') {
      return say(`${username}, you can only choose 'heads' or 'tails'.`);
    }
    
    let betAmount;
    if (args[1].toLowerCase() === 'all') {
      betAmount = user.wallet;
    } else {
      betAmount = parseInt(args[1]);
    }
    
    if (isNaN(betAmount) || betAmount <= 0) {
      return say(`${username}, please enter a valid bet amount.`);
    }
    
    if (betAmount > user.wallet) {
      return say(`${username}, you don't have enough money in your wallet. You have $${user.wallet.toLocaleString()}.`);
    }
    
    // Flip the coin
    const result = Math.random() < 0.5 ? 'heads' : 'tails';
    
    let resultMessage;
    user.stats.gamesPlayed += 1;
    
    if (result === choice) {
      // User wins
      const winnings = betAmount;
      user.wallet += winnings;
      user.stats.gamesWon += 1;
      user.stats.totalWinnings += winnings;
      resultMessage = `The coin landed on ${result}. You win $${winnings.toLocaleString()}!`;
    } else {
      // User loses
      user.wallet -= betAmount;
      user.stats.totalLosses += betAmount;
      resultMessage = `The coin landed on ${result}. You lose $${betAmount.toLocaleString()}.`;
    }
    
    await user.save();
    
    await say({
      blocks: [
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: `*${username}'s Coinflip*\n\n${resultMessage}\nYour wallet: $${user.wallet.toLocaleString()}`
          }
        }
      ]
    });
  },
  
  handleRoulette: async ({ message, say, args }) => {
    const userId = message.user;
    const username = await getUserMention(userId);
    const user = await getOrCreateUser(userId, username);
    
    if (!args || args.length < 2) {
      return say(`${username}, you need to specify your bet type and amount. Example: \`!Botname roulette red 100\` or \`!Botname roulette 23 100\``);
    }
    
    const betType = args[0].toLowerCase();
    let betAmount;
    
    if (args[1].toLowerCase() === 'all') {
      betAmount = user.wallet;
    } else {
      betAmount = parseInt(args[1]);
    }
    
    if (isNaN(betAmount) || betAmount <= 0) {
      return say(`${username}, please enter a valid bet amount.`);
    }
    
    if (betAmount > user.wallet) {
      return say(`${username}, you don't have enough money in your wallet. You have $${user.wallet.toLocaleString()}.`);
    }
    
    // Check bet type
    let validBetType = false;
    let payout = 0;
    let betTypeDisplay = '';
    
    // Number bet (0-36, 00)
    if (!isNaN(parseInt(betType)) && parseInt(betType) >= 0 && parseInt(betType) <= 36) {
      validBetType = true;
      payout = 35; // 35 to 1
      betTypeDisplay = `number ${betType}`;
    } else if (betType === '00') {
      validBetType = true;
      payout = 35; // 35 to 1
      betTypeDisplay = `number ${betType}`;
    }
    // Color bet
    else if (betType === 'red' || betType === 'black') {
      validBetType = true;
      payout = 1; // 1 to 1
      betTypeDisplay = `${betType}`;
    }
    // Even/odd bet
    else if (betType === 'even' || betType === 'odd') {
      validBetType = true;
      payout = 1; // 1 to 1
      betTypeDisplay = `${betType}`;
    }
    // High/low bet
    else if (betType === 'high') { // 19-36
      validBetType = true;
      payout = 1; // 1 to 1
      betTypeDisplay = `high numbers (19-36)`;
    }
    else if (betType === 'low') { // 1-18
      validBetType = true;
      payout = 1; // 1 to 1
      betTypeDisplay = `low numbers (1-18)`;
    }
    // Dozens
    else if (betType === '1st' || betType === 'first') { // 1-12
      validBetType = true;
      payout = 2; // 2 to 1
      betTypeDisplay = `1st dozen (1-12)`;
    }
    else if (betType === '2nd' || betType === 'second') { // 13-24
      validBetType = true;
      payout = 2; // 2 to 1
      betTypeDisplay = `2nd dozen (13-24)`;
    }
    else if (betType === '3rd' || betType === 'third') { // 25-36
      validBetType = true;
      payout = 2; // 2 to 1
      betTypeDisplay = `3rd dozen (25-36)`;
    }
    
    if (!validBetType) {
      return say(`${username}, please enter a valid bet type (number, red/black, even/odd, high/low, 1st/2nd/3rd dozen).`);
    }
    
    // Spin the wheel
    const result = getRouletteResult();
    const resultNumber = result === 37 ? '00' : result.toString();
    const resultColor = getRouletteColor(result);
    
    // Determine win/loss
    let win = false;
    
    if (!isNaN(parseInt(betType)) && parseInt(betType) === result) {
      win = true;
    } else if (betType === '00' && result === 37) {
      win = true;
    } else if (betType === resultColor) {
      win = true;
    } else if (betType === 'even' && result !== 0 && result !== 37 && result % 2 === 0) {
      win = true;
    } else if (betType === 'odd' && result !== 0 && result !== 37 && result % 2 === 1) {
      win = true;
    } else if (betType === 'high' && result >= 19 && result <= 36) {
      win = true;
    } else if (betType === 'low' && result >= 1 && result <= 18) {
      win = true;
    } else if ((betType === '1st' || betType === 'first') && result >= 1 && result <= 12) {
      win = true;
    } else if ((betType === '2nd' || betType === 'second') && result >= 13 && result <= 24) {
      win = true;
    } else if ((betType === '3rd' || betType === 'third') && result >= 25 && result <= 36) {
      win = true;
    }
    
    // Update user stats and balance
    let resultMessage;
    user.stats.gamesPlayed += 1;
    
    if (win) {
      const winnings = betAmount * payout;
      user.wallet += winnings;
      user.stats.gamesWon += 1;
      user.stats.totalWinnings += winnings;
      resultMessage = `The ball landed on ${resultNumber} ${resultColor}. You bet on ${betTypeDisplay} and won $${winnings.toLocaleString()}!`;
    } else {
      user.wallet -= betAmount;
      user.stats.totalLosses += betAmount;
      resultMessage = `The ball landed on ${resultNumber} ${resultColor}. You bet on ${betTypeDisplay} and lost $${betAmount.toLocaleString()}.`;
    }
    
    await user.save();
    
    await say({
      blocks: [
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: `*${username}'s Roulette Game*\n\n${resultMessage}\nYour wallet: $${user.wallet.toLocaleString()}`
          }
        }
      ]
    });
  },
  
  handleDuel: async ({ message, say, args }) => {
    if (!args || args.length < 2) {
      return say(`Please specify a user to duel and an amount. Example: \`!Botname duel @user 100\``);
    }
    
    const userId = message.user;
    const username = await getUserMention(userId);
    const user = await getOrCreateUser(userId, username);
    
    const targetId = args[0].replace(/[<@>]/g, '');
    
    if (targetId === userId) {
      return say(`${username}, you can't duel yourself.`);
    }
    
    const amount = parseInt(args[1]);
    
    if (isNaN(amount) || amount <= 0) {
      return say(`${username}, please enter a valid amount.`);
    }
    
    if (amount > user.wallet) {
      return say(`${username}, you don't have enough money. Your wallet: $${user.wallet.toLocaleString()}`);
    }
    
    // Check if target user exists and has enough money
    const targetUsername = await getUserMention(targetId);
    const target = await User.findOne({ userId: targetId });
    
    if (!target) {
      return say(`${targetUsername} doesn't have an economy account yet.`);
    }
    
    if (amount > target.wallet) {
      return say(`${targetUsername} doesn't have enough money for this duel. They have $${target.wallet.toLocaleString()} in their wallet.`);
    }
    
    // Determine winner (50/50 chance)
    const userWins = Math.random() < 0.5;
    
    // Update balances
    if (userWins) {
      user.wallet += amount;
      target.wallet -= amount;
      user.stats.gamesWon += 1;
      user.stats.totalWinnings += amount;
      target.stats.totalLosses += amount;
    } else {
      user.wallet -= amount;
      target.wallet += amount;
      target.stats.gamesWon += 1;
      target.stats.totalWinnings += amount;
      user.stats.totalLosses += amount;
    }
    
    user.stats.gamesPlayed += 1;
    target.stats.gamesPlayed += 1;
    
    await user.save();
    await target.save();
    
    const winner = userWins ? username : targetUsername;
    const loser = userWins ? targetUsername : username;
    
    await say({
      blocks: [
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: `*🏆 DUEL RESULTS 🏆*\n\n${winner} has won the duel against ${loser} and claimed $${amount.toLocaleString()}!`
          }
        }
      ]
    });
  },
  
  handleLotteryBuy: async ({ message, say, args }) => {
    const userId = message.user;
    const username = await getUserMention(userId);
    const user = await getOrCreateUser(userId, username);
    
    if (!args || !args.length) {
      return say(`${username}, please specify how many tickets to buy. Example: \`!Botname lottery buy 5\``);
    }
    
    const quantity = parseInt(args[0]);
    
    if (isNaN(quantity) || quantity <= 0) {
      return say(`${username}, please enter a valid number of tickets.`);
    }
    
    const ticketPrice = 100;
    const totalCost = ticketPrice * quantity;
    
    if (totalCost > user.wallet) {
      return say(`${username}, you don't have enough money to buy ${quantity} tickets. Total cost: $${totalCost.toLocaleString()}, Your wallet: $${user.wallet.toLocaleString()}`);
    }
    
    // Get or create active lottery
    let lottery = await Lottery.findOne({ active: true });
    
    if (!lottery) {
      // Create a new lottery if none exists
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + 1); // End in 24 hours
      
      lottery = new Lottery({
        pot: 1000, // Starting pot
        tickets: [],
        endDate: endDate
      });
    }
    
    // Add tickets to the lottery
    const existingTickets = lottery.tickets.find(t => t.userId === userId);
    
    if (existingTickets) {
      existingTickets.quantity += quantity;
    } else {
      lottery.tickets.push({
        userId: userId,
        username: username,
        quantity: quantity
      });
    }
    
    // Add to the pot (90% of ticket cost)
    lottery.pot += Math.floor(totalCost * 0.9);
    
    // Update user's wallet
    user.wallet -= totalCost;
    
    await lottery.save();
    await user.save();
    
    // Calculate total tickets and user's chances
    const totalTickets = lottery.tickets.reduce((sum, ticket) => sum + ticket.quantity, 0);
    const userTickets = lottery.tickets.find(t => t.userId === userId).quantity;
    const winChance = (userTickets / totalTickets * 100).toFixed(2);
    
    await say({
      blocks: [
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: `${username} bought ${quantity} lottery tickets for $${totalCost.toLocaleString()}!\n\n`+
                  `*Current Pot:* $${lottery.pot.toLocaleString()}\n`+
                  `*Your Tickets:* ${userTickets}\n`+
                  `*Total Tickets:* ${totalTickets}\n`+
                  `*Win Chance:* ${winChance}%\n`+
                  `*Drawing:* ${lottery.endDate.toLocaleString()}`
          }
        }
      ]
    });
  },
  
  handleLotteryPot: async ({ message, say }) => {
    const userId = message.user;
    const username = await getUserMention(userId);
    
    // Get active lottery
    const lottery = await Lottery.findOne({ active: true });
    
    if (!lottery) {
      return say(`There is currently no active lottery. Start one by buying tickets!`);
    }
    
    // Calculate total tickets
    const totalTickets = lottery.tickets.reduce((sum, ticket) => sum + ticket.quantity, 0);
    
    // Check if user has tickets
    const userTickets = lottery.tickets.find(t => t.userId === userId);
    const userTicketCount = userTickets ? userTickets.quantity : 0;
    const winChance = userTicketCount > 0 ? (userTicketCount / totalTickets * 100).toFixed(2) : 0;
    
    // Time until drawing
    const now = new Date();
    const timeLeft = lottery.endDate > now ? formatTimeRemaining(lottery.endDate, now) : 'Soon';
    
    await say({
      blocks: [
        {
          type: "header",
          text: {
            type: "plain_text",
            text: "🎟️ LOTTERY INFORMATION 🎟️",
            emoji: true
          }
        },
        {
          type: "section",
          fields: [
            {
              type: "mrkdwn",
              text: `*Current Pot:* $${lottery.pot.toLocaleString()}`
            },
            {
              type: "mrkdwn",
              text: `*Total Tickets:* ${totalTickets}`
            }
          ]
        },
        {
          type: "section",
          fields: [
            {
              type: "mrkdwn",
              text: `*Your Tickets:* ${userTicketCount}`
            },
            {
              type: "mrkdwn",
              text: `*Your Win Chance:* ${winChance}%`
            }
          ]
        },
        {
          type: "section",
          fields: [
            {
              type: "mrkdwn",
              text: `*Drawing In:* ${timeLeft}`
            },
            {
              type: "mrkdwn",
              text: `*Ticket Price:* $100 each`
            }
          ]
        },
        {
          type: "context",
          elements: [
            {
              type: "mrkdwn",
              text: "Buy tickets with `!Botname lottery buy <amount>`"
            }
          ]
        }
      ]
    });
  }
};