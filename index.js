const { Client, GatewayIntentBits } = require("discord.js");

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent]
});

client.once("ready", () => {
  console.log("Bot online");
});

client.on("messageCreate", (message) => {
  if (message.author.bot) return;

  if (message.content.toLowerCase() === "help") {
    message.reply("📜 Commands:\nhelp\nping\nngocay");
  }

  if (message.content.toLowerCase() === "ping") {
    message.reply("🏓 Pong!");
  }

  if (message.content.toLowerCase() === "ngocay") {
    message.reply({
      content: "Ngô Cay 🌽",
      files: ["https://png.pngtree.com/png-vector/20250918/ourmid/pngtree-hot-steamed-corn-on-cob-served-with-butter-and-masala-seasoning-png-image_17496796.webp"]
    });
  }

});

  if (message.content.toLowerCase() === "help") {
    message.reply("📜 Commands:\nhelp\nping\ninfo");
  }

  if (message.content.toLowerCase() === "ping") {
    message.reply("🏓 Pong!");
  }

  if (message.content.toLowerCase() === "info") {
    message.reply("🤖 Bot đang chạy trên Railway!");
  }
});

client.login(process.env.TOKEN);
