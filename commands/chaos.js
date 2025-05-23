const User = require('../models/user');
const { getUserMention } = require('../utils/helpers');
const axios = require('axios');

module.exports = {
  handlePunch: async ({ message, say, args }) => {
    if (!args || !args.length) {
      return say(`Please specify someone to punch. Example: \`!UwU punch @user\``);
    }
    
    const userId = message.user;
    const username = await getUserMention(userId);
    const targetUser = args[0].replace(/[<@>]/g, '');
    const targetUsername = await getUserMention(targetUser);
    
    if (targetUser === userId) {
      return say(`${username} tried to punch themselves but missed. What was the point of that?`);
    }
    
    // Random chance to steal coins
    const stealCoins = Math.random() < 0.3; // 30% chance
    let stealMessage = "";
    
    if (stealCoins) {
      const user = await User.findOne({ userId });
      const target = await User.findOne({ userId: targetUser });
      
      if (target && target.wallet > 0) {
        const stolenAmount = Math.floor(Math.random() * Math.min(100, target.wallet));
        
        if (stolenAmount > 0) {
          target.wallet -= stolenAmount;
          user.wallet += stolenAmount;
          
          await user.save();
          await target.save();
          
          stealMessage = ` and stole $${stolenAmount}!`;
        }
      }
    }
    
    const punchMessages = [
      `${username} punched ${targetUsername} right in the face${stealMessage}`,
      `${username} threw a solid right hook at ${targetUsername}${stealMessage}`,
      `${username} landed a devastating uppercut on ${targetUsername}${stealMessage}`,
      `${username} punched ${targetUsername} so hard they saw stars${stealMessage}`,
      `${username} gave ${targetUsername} a knuckle sandwich${stealMessage}`
    ];
    
    const randomMessage = punchMessages[Math.floor(Math.random() * punchMessages.length)];
    await say(randomMessage);
  },
  
  handleSlap: async ({ message, say, args }) => {
    if (!args || !args.length) {
      return say(`Please specify someone to slap. Example: \`!UwU slap @user\``);
    }
    
    const userId = message.user;
    const username = await getUserMention(userId);
    const targetUser = args[0].replace(/[<@>]/g, '');
    const targetUsername = await getUserMention(targetUser);
    
    if (targetUser === userId) {
      return say(`${username} tried to slap themselves. Weird flex, but okay.`);
    }
    
    const slapObjects = [
      "a large trout", "a wet fish", "a keyboard", "a dictionary",
      "a slice of pizza", "a rubber chicken", "a rolled-up newspaper",
      "a physics textbook", "a stack of papers", "a banana peel",
      "a cream pie", "a sock puppet", "a glove", "a frying pan",
      "a rainbow trout", "a laptop"
    ];
    
    const randomObject = slapObjects[Math.floor(Math.random() * slapObjects.length)];
    await say(`${username} slapped ${targetUsername} around with ${randomObject}. Ouch!`);
  },
  
  handleSimp: async ({ message, say, args }) => {
    if (!args || !args.length) {
      return say(`Please specify someone to simp for. Example: \`!UwU simp @user\``);
    }
    
    const userId = message.user;
    const username = await getUserMention(userId);
    const user = await User.findOne({ userId });
    
    if (!user) {
      return say(`${username}, you need to have an account first. Try using some economy commands!`);
    }
    
    const targetUser = args[0].replace(/[<@>]/g, '');
    const targetUsername = await getUserMention(targetUser);
    
    if (targetUser === userId) {
      return say(`${username} tried to simp for themselves. That's... not how it works.`);
    }
    
    const target = await User.findOne({ userId: targetUser });
    if (!target) {
      return say(`That user hasn't used the economy system yet!`);
    }
    
    // Amount to simp (1-10% of wallet)
    const minAmount = 10;
    if (user.wallet < minAmount) {
      return say(`${username} doesn't have enough money to simp for ${targetUsername}. Need at least $${minAmount}!`);
    }
    
    const maxSimpAmount = Math.floor(user.wallet * 0.1); // 10% of wallet
    const simpAmount = Math.max(minAmount, Math.floor(Math.random() * maxSimpAmount) + 1);
    
    // 70% chance of success
    const success = Math.random() < 0.7;
    
    if (success) {
      // Transfer money
      user.wallet -= simpAmount;
      target.wallet += simpAmount;
      
      await user.save();
      await target.save();
      
      const successMessages = [
        `${username} simped for ${targetUsername} and gave them $${simpAmount}. How sweet!`,
        `${username} donated $${simpAmount} to ${targetUsername}'s stream. What a loyal fan!`,
        `${username} bought ${targetUsername} a coffee for $${simpAmount}. They noticed you!`,
        `${username} sent $${simpAmount} to ${targetUsername} with a heart emoji. They actually responded!`,
        `${username} tipped ${targetUsername} $${simpAmount}. They smiled at you!`
      ];
      
      const randomMessage = successMessages[Math.floor(Math.random() * successMessages.length)];
      await say(randomMessage);
    } else {
      // No money transfer, just embarrassment
      const failMessages = [
        `${username} tried to simp for ${targetUsername} but got left on read.`,
        `${username} wrote a love letter to ${targetUsername} but it was used as a napkin.`,
        `${username} tried to impress ${targetUsername} but tripped and fell instead.`,
        `${username} attempted to compliment ${targetUsername} but stuttered the whole time.`,
        `${username} bought flowers for ${targetUsername} but discovered they're allergic.`
      ];
      
      const randomMessage = failMessages[Math.floor(Math.random() * failMessages.length)];
      await say(randomMessage);
    }
  },
  
  handleYeet: async ({ message, say, args }) => {
    if (!args || !args.length) {
      return say(`Please specify someone to yeet. Example: \`!UwU yeet @user\``);
    }
    
    const userId = message.user;
    const username = await getUserMention(userId);
    const targetUser = args[0].replace(/[<@>]/g, '');
    const targetUsername = await getUserMention(targetUser);
    
    if (targetUser === userId) {
      return say(`${username} tried to yeet themselves but physics doesn't work that way.`);
    }
    
    const yeetMessages = [
      `${username} YEETS ${targetUsername} into the sun.`,
      `${username} yeeted ${targetUsername} out of the server and into another dimension.`,
      `${username} grabs ${targetUsername} and launches them into orbit.`,
      `${username} yeets ${targetUsername} over the nearest mountain.`,
      `${username} casually throws ${targetUsername} across the room at Mach 5.`,
      `${username} picks up ${targetUsername} and just... YEET!`,
      `${username} calculates the exact angle and velocity required to yeet ${targetUsername} to the moon.`
    ];
    
    const randomMessage = yeetMessages[Math.floor(Math.random() * yeetMessages.length)];
    await say(randomMessage);
  },
  
  handleRoast: async ({ message, say, args }) => {
    if (!args || !args.length) {
      return say(`Please specify someone to roast. Example: \`!UwU roast @user\``);
    }
    
    const userId = message.user;
    const username = await getUserMention(userId);
    const targetUser = args[0].replace(/[<@>]/g, '');
    const targetUsername = await getUserMention(targetUser);
    
    if (targetUser === userId) {
      return say(`${username} tried to roast themselves. That's what we call self-burn. Those are rare!`);
    }
    
    const roasts = [
      `${targetUsername} is so slow, they got outrun by a glacier.`,
      `${targetUsername}'s coding skills are like HTML – barely a language.`,
      `I'd roast ${targetUsername}, but my mom said I shouldn't burn trash.`,
      `${targetUsername} is living proof that evolution can go in reverse.`,
      `${targetUsername} is not useless – they can always serve as a bad example.`,
      `${targetUsername} brings everyone so much joy... when they leave the room.`,
      `${targetUsername} is like a cloud: when they disappear, it's a beautiful day.`,
      `If ${targetUsername} was any more dense, they'd have their own gravitational pull.`,
      `${targetUsername} has an entire tree dedicated to replacing the oxygen they waste.`,
      `${targetUsername}'s presence here is like a typo in code – unnecessary and annoying.`
    ];
    
    const randomRoast = roasts[Math.floor(Math.random() * roasts.length)];
    await say(`${username} roasts: ${randomRoast}`);
  },
  
  handleMeme: async ({ message, say }) => {
    const userId = message.user;
    const username = await getUserMention(userId);
    
    try {
      // Call a meme API
      const response = await axios.get('https://meme-api.herokuapp.com/gimme');
      if (response.data && response.data.url) {
        await say({
          blocks: [
            {
              type: "section",
              text: {
                type: "mrkdwn",
                text: `${username} requested a meme:`
              }
            },
            {
              type: "image",
              image_url: response.data.url,
              alt_text: "Random meme"
            }
          ]
        });
      } else {
        await say(`Sorry, couldn't find a meme right now. Try again later!`);
      }
    } catch (error) {
      console.error('Error fetching meme:', error);
      await say(`Sorry, couldn't fetch a meme right now. Try again later!`);
    }
  }
};