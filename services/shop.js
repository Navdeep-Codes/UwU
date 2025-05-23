const Shop = require('../models/shop');

async function initializeShop() {
  const count = await Shop.countDocuments();
  
  if (count === 0) {
    const shopItems = [
      // Tools (give advantages in economy)
      {
        itemId: 'fishing_rod',
        name: 'Fishing Rod',
        description: 'Allows you to fish for coins (new command: fish)',
        price: 1000,
        type: 'tool',
        effect: { command: 'fish', cooldown: 20 * 60 * 1000, minReward: 50, maxReward: 200 },
        sellable: true,
        sellPrice: 400
      },
      {
        itemId: 'hunting_rifle',
        name: 'Hunting Rifle',
        description: 'Hunt animals for coins (new command: hunt)',
        price: 2500,
        type: 'tool',
        effect: { command: 'hunt', cooldown: 30 * 60 * 1000, minReward: 100, maxReward: 500 },
        sellable: true,
        sellPrice: 1000
      },
      {
        itemId: 'shovel',
        name: 'Shovel',
        description: 'Dig for buried treasure (new command: dig)',
        price: 1500,
        type: 'tool',
        effect: { command: 'dig', cooldown: 45 * 60 * 1000, minReward: 0, maxReward: 1000 },
        sellable: true,
        sellPrice: 600
      },
      
      // Boosters (temporary effects)
      {
        itemId: 'lucky_coin',
        name: 'Lucky Coin',
        description: '10% higher gambling wins for 1 hour',
        price: 5000,
        type: 'booster',
        effect: { stat: 'gambling', multiplier: 1.1, duration: 60 * 60 * 1000 },
        sellable: true,
        sellPrice: 2000
      },
      {
        itemId: 'wage_bonus',
        name: 'Wage Bonus',
        description: '20% more from work/jobs for 3 hours',
        price: 3000,
        type: 'booster',
        effect: { stat: 'work', multiplier: 1.2, duration: 3 * 60 * 60 * 1000 },
        sellable: true,
        sellPrice: 1200
      },
      {
        itemId: 'robbery_tools',
        name: 'Robbery Tools',
        description: '15% higher success rate when robbing for 2 hours',
        price: 4000,
        type: 'booster',
        effect: { stat: 'rob', successBonus: 0.15, duration: 2 * 60 * 60 * 1000 },
        sellable: true,
        sellPrice: 1600
      },
      
      // Collectibles (status symbols)
      {
        itemId: 'diamond_necklace',
        name: 'Diamond Necklace',
        description: 'A shiny status symbol to flex on others',
        price: 50000,
        type: 'collectible',
        effect: null,
        sellable: true,
        sellPrice: 25000
      },
      {
        itemId: 'sports_car',
        name: 'Sports Car',
        description: 'Vroom vroom! The ultimate flex.',
        price: 100000,
        type: 'collectible',
        effect: null,
        sellable: true,
        sellPrice: 50000
      },
      {
        itemId: 'yacht',
        name: 'Luxury Yacht',
        description: 'For when you really need to show off',
        price: 250000,
        type: 'collectible',
        effect: null,
        sellable: true,
        sellPrice: 125000
      },
      
      // Badges (special permanent effects)
      {
        itemId: 'vip_badge',
        name: 'VIP Badge',
        description: 'Permanent +5% to all earnings',
        price: 30000,
        type: 'badge',
        effect: { allMultiplier: 1.05 },
        sellable: false
      },
      {
        itemId: 'investor_badge',
        name: 'Investor Badge',
        description: 'Interest on your bank balance (0.5% daily)',
        price: 75000,
        type: 'badge',
        effect: { bankInterest: 0.005, period: 'daily' },
        sellable: false
      },
      {
        itemId: 'whale_badge',
        name: 'Whale Badge',
        description: 'Gambling limits increased by 50%',
        price: 100000,
        type: 'badge',
        effect: { gamblingLimitMultiplier: 1.5 },
        sellable: false
      }
    ];
    
    await Shop.insertMany(shopItems);
    console.log(`Initialized ${shopItems.length} shop items`);
  }
}

module.exports = {
  initializeShop
};