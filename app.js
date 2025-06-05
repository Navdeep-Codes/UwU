require("dotenv").config();
const { App } = require("@slack/bolt");
const fs = require("fs");
const path = require("path");

const COMMAND_PREFIX = "!U";
const COMMANDS = new Map();

const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  socketMode: true,
  appToken: process.env.SLACK_APP_TOKEN,
});

// commands
const commandFolders = fs.readdirSync("./commands");
for (const folder of commandFolders) {
  const folderPath = path.join(__dirname, "commands", folder);
  const commandFiles = fs.readdirSync(folderPath).filter(f => f.endsWith(".js"));

  for (const file of commandFiles) {
    const command = require(path.join(folderPath, file));
    if (command.name && typeof command.run === "function") {
      COMMANDS.set(command.name.toLowerCase(), command);
      console.log(`✅ Loaded ${command.name} from ${folder}`);
    }
  }
}

app.message(async ({ message, say, context }) => {
  try {
    if (!message.text || !message.text.startsWith(COMMAND_PREFIX)) return;

    const args = message.text.slice(COMMAND_PREFIX.length).trim().split(/ +/g);
    const commandName = args.shift()?.toLowerCase();
    const command = COMMANDS.get(commandName);

    if (!command) {
      await say(`❓ Unknown command: \`${commandName}\``);
      return;
    }

    await command.run({
      message,
      say,
      args,
      user: message.user,
      commandName,
      text: args.join(" "),
      context,
    });

  } catch (err) {
    console.error("❌ Error handling message:", err);
  }
});

// Start app
(async () => {
  await app.start(process.env.PORT || 3000);
  console.log("⚡ Slack Bot is running!");
})();
