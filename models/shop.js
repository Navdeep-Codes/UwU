const mongoose = require('mongoose');

const shopSchema = new mongoose.Schema({
  itemId: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  type: {
    type: String,
    enum: ['tool', 'booster', 'collectible', 'badge'],
    required: true
  },
  effect: {
    type: Object,
    default: null
  },
  sellable: {
    type: Boolean,
    default: true
  },
  sellPrice: {
    type: Number,
    default: function() {
      return Math.floor(this.price * 0.5);
    }
  }
});

module.exports = mongoose.model('Shop', shopSchema);