const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    unique: true
  },
  username: {
    type: String,
    required: true
  },
  wallet: {
    type: Number,
    default: 0
  },
  bank: {
    type: Number,
    default: 0
  },
  lastDaily: {
    type: Date,
    default: null
  },
  lastWeekly: {
    type: Date,
    default: null
  },
  lastWork: {
    type: Date,
    default: null
  },
  lastBeg: {
    type: Date,
    default: null
  },
  lastRob: {
    type: Date,
    default: null
  },
  // Tool command cooldowns
  lastFishing: {
    type: Date,
    default: null
  },
  lastHunting: {
    type: Date,
    default: null
  },
  lastDig: {
    type: Date,
    default: null
  },
  inventory: [{
    itemId: String,
    name: String,
    description: String,
    quantity: Number,
    type: String
  }],
  activeBoosts: [{
    itemId: String,
    name: String,
    stat: String,
    multiplier: Number,
    startTime: Date,
    endTime: Date
  }],
  stats: {
    gamesPlayed: {
      type: Number,
      default: 0
    },
    gamesWon: {
      type: Number,
      default: 0
    },
    totalWinnings: {
      type: Number,
      default: 0
    },
    totalLosses: {
      type: Number,
      default: 0
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Middleware to clean expired boosts before saving
userSchema.pre('save', function(next) {
  if (this.activeBoosts && this.activeBoosts.length > 0) {
    const now = new Date();
    this.activeBoosts = this.activeBoosts.filter(boost => boost.endTime > now);
  }
  next();
});

module.exports = mongoose.model('User', userSchema);