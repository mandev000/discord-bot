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
  
if (message.content === "Thưởng Thơ") {
message.reply(`Ngô vàng thơm giữa chiều nay
Gió nhẹ thổi qua ruộng ngô lay
Hạt vàng nướng lửa thơm bay
Thêm chút ớt cay đậm vị ngày hè.

Cắn vào giòn rụm mê say
Ngọt bùi hòa với chút cay đầu môi
Bạn bè ngồi cạnh cười vui
Thưởng thơ, ăn ngô, đất trời bình yên 🌽🔥`);
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
// MINIGAME TÀI XỈU
if (message.content.startsWith("taixiu")) {

const args = message.content.split(" ");
const choice = args[1];

if (!choice) {
return message.reply("🎲 Chọn **tai** hoặc **xiu**\nVí dụ: taixiu tai");
}

const dice1 = Math.floor(Math.random() * 6) + 1;
const dice2 = Math.floor(Math.random() * 6) + 1;
const dice3 = Math.floor(Math.random() * 6) + 1;

const total = dice1 + dice2 + dice3;

let result = total >= 11 ? "tai" : "xiu";

if (choice === result) {
message.reply(`🎉 Bạn thắng!

🎲 Xúc xắc: ${dice1} | ${dice2} | ${dice3}
📊 Tổng: ${total}
🔥 Kết quả: ${result.toUpperCase()}`);
} else {
message.reply(`💀 Bạn thua!

🎲 Xúc xắc: ${dice1} | ${dice2} | ${dice3}
📊 Tổng: ${total}
🔥 Kết quả: ${result.toUpperCase()}`);
    });
  }
});

}
client.login(process.env.TOKEN);
