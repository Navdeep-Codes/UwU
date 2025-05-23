const mongoose = require('mongoose');

const lotterySchema = new mongoose.Schema({
  active: {
    type: Boolean,
    default: true
  },
  pot: {
    type: Number,
    default: 1000
  },
  tickets: [{
    userId: String,
    username: String,
    quantity: Number
  }],
  startDate: {
    type: Date,
    default: Date.now
  },
  endDate: {
    type: Date,
    required: true
  },
  winner: {
    type: mongoose.Schema.Types.Mixed,
    default: null
  }
});

module.exports = mongoose.model('Lottery', lotterySchema);