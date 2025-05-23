const cron = require('cron');
const { WebClient } = require('@slack/web-api');
const web = new WebClient(process.env.SLACK_BOT_TOKEN);
const User = require('../models/user');
const Lottery = require('../models/lottery');
const { getUserMention } = require('../utils/helpers');

/**
 * Draw a lottery winner based on tickets owned
 */
async function drawLotteryWinner() {
  try {
    // Find active lottery
    const lottery = await Lottery.findOne({ active: true });
    
    if (!lottery || lottery.tickets.length === 0) {
      console.log('No active lottery or no participants');
      return;
    }
    
    // Choose winner based on tickets (weighted random)
    // Each ticket is one entry in the pool
    const ticketPool = [];
    
    lottery.tickets.forEach(entry => {
      for (let i = 0; i < entry.quantity; i++) {
        ticketPool.push(entry.userId);
      }
    });
    
    if (ticketPool.length === 0) {
      console.log('No tickets in the pool');
      return;
    }
    
    // Select random ticket
    const winningTicketIndex = Math.floor(Math.random() * ticketPool.length);
    const winnerUserId = ticketPool[winningTicketIndex];
    
    // Find winner info
    const winnerEntry = lottery.tickets.find(entry => entry.userId === winnerUserId);
    const winnerUser = await User.findOne({ userId: winnerUserId });
    const winnerUsername = await getUserMention(winnerUserId);
    
    // Update winner's wallet
    if (winnerUser) {
      winnerUser.wallet += lottery.pot;
      winnerUser.stats.totalWinnings += lottery.pot;
      await winnerUser.save();
    }
    
    // Set lottery as inactive and record winner
    lottery.active = false;
    lottery.winner = {
      userId: winnerUserId,
      username: winnerUsername,
      amount: lottery.pot
    };
    await lottery.save();
    
    // Announce winner in gambling channel
    await web.chat.postMessage({
      channel: process.env.GAMBLING_CHANNEL_ID,
      blocks: [
        {
          type: "header",
          text: {
            type: "plain_text",
            text: "🎉 LOTTERY WINNER ANNOUNCEMENT 🎉",
            emoji: true
          }
        },
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: `The lottery drawing has been completed!\n\n*Winner:* ${winnerUsername}\n*Prize pot:* $${lottery.pot.toLocaleString()}\n\nCongratulations! The winnings have been added to your wallet.`
          }
        },
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: "A new lottery will begin shortly. Good luck to everyone in the next draw!"
          }
        }
      ]
    });
    
    // Create new lottery
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + 1); // End in 24 hours
    
    const newLottery = new Lottery({
      active: true,
      pot: 1000, // Starting pot
      tickets: [],
      startDate: new Date(),
      endDate: endDate
    });
    
    await newLottery.save();
    console.log('New lottery created');
    
  } catch (error) {
    console.error('Error drawing lottery winner:', error);
  }
}

/**
 * Initialize lottery system
 */
async function initializeLottery() {
  // Check if there's an active lottery, create one if not
  const activeLottery = await Lottery.findOne({ active: true });
  
  if (!activeLottery) {
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + 1); // End in 24 hours
    
    const newLottery = new Lottery({
      active: true,
      pot: 1000, // Starting pot
      tickets: [],
      startDate: new Date(),
      endDate: endDate
    });
    
    await newLottery.save();
    console.log('Initial lottery created');
  }
  
  // Schedule daily lottery drawing (midnight UTC)
  const lotteryJob = new cron.CronJob('0 0 * * *', drawLotteryWinner);
  lotteryJob.start();
  console.log('Lottery drawing scheduled');
}

module.exports = {
  initializeLottery,
  drawLotteryWinner
};