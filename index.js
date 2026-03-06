const { Client, GatewayIntentBits } = require('discord.js');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

client.on("ready", () => {
  console.log("Bot đã online");
});

client.on("messageCreate", (message) => {
  if (message.content === "help") {
    message.reply("Danh sách lệnh:\nhelp - trợ giúp");
  }
});

client.login(process.env.TOKEN);
