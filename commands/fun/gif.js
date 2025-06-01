const fetch = (...args) => import('node-fetch').then(mod => mod.default(...args));

module.exports = {
  name: "gif",
  
  run: async ({ say, text }) => {
    
    if (!text) return say("❌ Please provide a search term. Example: `!U gif happy`");

    const apiKey = process.env.GIPHY_API_KEY;
    const url = `https://api.giphy.com/v1/gifs/search?api_key=${apiKey}&q=${encodeURIComponent(text)}&limit=10`;

    try {
      const res = await fetch(url);
      const data = await res.json();

      if (!data.data.length) {
        return say(`❌ No GIFs found for *${text}*.`);
      }

      const gif = data.data[Math.floor(Math.random() * data.data.length)];
      await say(` Here is a ${text} GIF ${gif.url}`);
    } catch (err) {
      console.error(err);
      await say("❌ Failed to fetch GIF.");
    }
  }
};
