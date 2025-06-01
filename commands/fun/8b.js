module.exports = {
  name: "8b",
  run: async ({ say, text }) => {
    const responses = [
      "Yes.",
      "No.",
      "Maybe.",
      "Absolutely!",
      "Ask again later...",
      "I doubt it.",
      "Definitely not.",
      "Fuck Yeah!",
    ];
    const answer = responses[Math.floor(Math.random() * responses.length)];
    await say(`🎱 *${text}* — ${answer}`);
  },
};
