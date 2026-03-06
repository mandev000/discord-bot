const { Client, GatewayIntentBits } = require("discord.js");

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent]
});

client.on("ready", () => {
  console.log(`Bot online ${client.user.tag}`);
});

client.on("messageCreate", (message) => {
  if (message.author.bot) return;

  if (message.content.toLowerCase() === "help") {
    message.reply("📜 Lệnh bot:\nhelp - xem lệnh");
  }
});

client.login(process.env.TOKEN || "MTQzNDg4NTYwMjQ5ODgzODY0MQ.G19fD2.rRDWgd4XN_-QlupaquI-sJo44DK6JfyzDc8Fy4");
