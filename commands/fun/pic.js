module.exports = {
  name: "pic",
  run: async ({ say }) => {
    const randomId = Math.floor(Math.random() * 1000);
    const imgUrl = `https://picsum.photos/seed/${randomId}/500/300`;
    await say(`:frame_with_picture-magic_wand: <${imgUrl}|Here>'s a random picture:`);
  }
};
