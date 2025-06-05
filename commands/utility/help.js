module.exports = {
  name: "help",
  run: async ({ say, user }) => {
    const helpMessage = `
:hii: *Hello! I'm UwU a multifun bot!*

Here are some commands you can use:

- \`!U help\` - Show this help message \n
- \`!U pets\` - Show your equipped pet\n
- \`!U zoo\` - Show your animal collection\n
- \`!U battle @user\` - Challenge another user to a battle\n
- \`!U hunt\` - Go hunting for new animals\n
- \`!U shop\` - View the item shop\n
- \`!U equip [animal name]\` - Equip an animal as your companion\n
- \`!U sell [animal name]\` - Sell an animal from your collection\n
- \`!U attach [item name]\` - Attach an item to your equipped animal\n
- \`!U inventory\` - View your item inventory\n
  `;
    
    await say({
      text: helpMessage,
      user: user,
      ephemeral: true,
    });
  }
};