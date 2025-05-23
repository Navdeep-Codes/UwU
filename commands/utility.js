const User = require('../models/user');

module.exports = {
  handleDashboard: async ({ command, ack, respond }) => {
    await ack();
    
    try {
      const userId = command.user_id;
      const user = await User.findOne({ userId });
      
      if (!user) {
        return await respond(`You don't have an account yet. Start playing to create one!`);
      }
      
      await respond({
        blocks: [
          {
            type: "header",
            text: {
              type: "plain_text",
              text: "Your Dashboard",
              emoji: true
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
              }
            ]
          },
          {
            type: "section",
            fields: [
              {
                type: "mrkdwn",
                text: `*Games Played:* ${user.stats.gamesPlayed}`
              },
              {
                type: "mrkdwn",
                text: `*Win Rate:* ${user.stats.gamesPlayed > 0 ? Math.round((user.stats.gamesWon / user.stats.gamesPlayed) * 100) : 0}%`
              }
            ]
          },
          {
            type: "section",
            fields: [
              {
                type: "mrkdwn",
                text: `*Total Winnings:* $${user.stats.totalWinnings.toLocaleString()}`
              },
              {
                type: "mrkdwn",
                text: `*Total Losses:* $${user.stats.totalLosses.toLocaleString()}`
              }
            ]
          },
          {
            type: "section",
            text: {
              type: "mrkdwn",
              text: `*Account created:* ${user.createdAt.toLocaleDateString()}`
            }
          }
        ]
      });
    } catch (error) {
      console.error(error);
      await respond('An error occurred while generating your dashboard.');
    }
  },
  
  handleHelp: async ({ command, ack, respond }) => {
    await ack();
    
    await respond({
      blocks: [
        {
          type: "header",
          text: {
            type: "plain_text",
            text: "UwU Help",
            emoji: true
          }
        },
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: "How to use me:"
          }
        },
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: "*Slash Commands:*\n`/dashboard` - View your economy stats\n`/help` - Show this help message"
          }
        },
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: "*Message Commands:*\nUse `!UwU` followed by any of these commands:"
          }
        },
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: "*Economy:* \n1. Balance \n2. Daily \n3. Weekly \n4. Work \n5. Deposit \n6. Withdraw \n7. Rob \n8. Inventory \n9. Shop \n10. Buy \n11. Sell \n12. Give \n13. Leaderboard"
          }
        },
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: "*Gambling:* \n1. Slots \n2. Blackjack \n3. Dice \n4. Coinflip \n5. Roulette \n6. Duel \n7. Lottery buy \n8. Lottery pot"
          }
        },
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: "*Chaos:* \n1. Punch \n2. Slap \n3. Simp \n4. Yeet \n5. Roast \n6. Meme"
          }
        },
        {
          type: "context",
          elements: [
            {
              type: "mrkdwn",
              text: "Need help? Contact <@U083T3ZP6AV>"
            }
          ]
        }
      ]
    });
  }
};