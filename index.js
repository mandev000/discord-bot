const { Client, GatewayIntentBits } = require("discord.js");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ],
});

client.once("ready", () => {
  console.log("Bot đã online!");
});

client.on("messageCreate", (message) => {
  if (message.author.bot) return;

  if (message.content.toLowerCase() === "help") {
    message.reply("📜 Lệnh:\nhelp\nping\nngocay");
  }
  
    if (message.content.toLowerCase() === "Thưởng Thơ") {
    message.reply("Ngô vàng thơm giữa chiều nay,
Rắc thêm chút ớt hóa thành ngô cay.
Cắn vào giòn rụm mê say,
Vừa ăn vừa hít, mắt cay cay cười. 😆
Hạt ngô nhỏ bé xinh tươi,
Tẩm thêm vị ớt làm người nhớ lâu.
Bạn bè ngồi tụm bên nhau,
Gói ngô cay nhỏ hóa thành niềm vui. 🌶️🌽
Ăn rồi lại muốn ăn hoài,
Cay cay đầu lưỡi, ngọt ngoài hạt ngô.
Đơn sơ món quà tuổi nhỏ,
Mà sao thương nhớ đến giờ vẫn đây");
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

client.login(process.env.TOKEN);
