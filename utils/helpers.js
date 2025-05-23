const { WebClient } = require('@slack/web-api');
const web = new WebClient(process.env.SLACK_BOT_TOKEN);

/**
 * Get a user's display name from Slack
 * @param {string} userId - The Slack user ID
 * @returns {Promise<string>} The user's display name
 */
async function getUserMention(userId) {
  try {
    const result = await web.users.info({ user: userId });
    if (result.user) {
      return `<@${userId}>`; // Return the user mention format
    }
    return `<@${userId}>`;
  } catch (error) {
    console.error('Error fetching user info:', error);
    return `<@${userId}>`;
  }
}

/**
 * Format a number as currency
 * @param {number} amount - The amount to format
 * @returns {string} The formatted amount
 */
function formatCurrency(amount) {
  return `$${amount.toLocaleString()}`;
}

/**
 * Calculate time remaining in a readable format
 * @param {Date} futureDate - The future date
 * @param {Date} now - The current date
 * @returns {string} Formatted time string
 */
function formatTimeRemaining(futureDate, now = new Date()) {
  const timeLeft = futureDate - now;
  
  if (timeLeft <= 0) {
    return "now";
  }
  
  const days = Math.floor(timeLeft / (24 * 60 * 60 * 1000));
  const hours = Math.floor((timeLeft % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
  const minutes = Math.floor((timeLeft % (60 * 60 * 1000)) / (60 * 1000));
  const seconds = Math.floor((timeLeft % (60 * 1000)) / 1000);
  
  const parts = [];
  if (days > 0) parts.push(`${days}d`);
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}m`);
  if (seconds > 0) parts.push(`${seconds}s`);
  
  return parts.join(" ");
}

/**
 * Parse a bet amount from text
 * @param {string} betText - The bet text
 * @param {number} maxAmount - The maximum allowed amount
 * @returns {number|null} The parsed bet amount or null if invalid
 */
function parseBetAmount(betText, maxAmount) {
  if (!betText) return null;
  
  if (betText.toLowerCase() === 'all') {
    return maxAmount;
  }
  
  if (betText.toLowerCase() === 'half') {
    return Math.floor(maxAmount / 2);
  }
  
  const amount = parseInt(betText);
  if (isNaN(amount) || amount <= 0) {
    return null;
  }
  
  return Math.min(amount, maxAmount);
}

module.exports = {
  getUserMention,
  formatCurrency,
  formatTimeRemaining,
  parseBetAmount
};