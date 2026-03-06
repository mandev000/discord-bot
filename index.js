const { Client, GatewayIntentBits } = require("discord.js");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

let money = {};

client.once("ready", () => {
  console.log("Bot đã online!");
});

client.on("messageCreate", (message) => {

  if (message.author.bot) return;

  const msg = message.content.toLowerCase();
  const user = message.author.id;

  if (!money[user]) money[user] = 0;

  // HELP
  if (msg === "help") {
    message.reply(`📜 LỆNH BOT

help
ping
ngocay
thưởng thơ

🎮 GAME
taixiu tai
taixiu xiu

💰 TIỀN
daily
money`);
  }

  // PING
  if (msg === "ping") {
    message.reply("🏓 Pong!");
  }

  // NGÔ CAY
  if (msg === "ngocay") {
    message.reply({
      content: "🌽 Ngô cay",
      files: ["https://i.imgur.com/9Xn6F6C.png"]
    });
  }

  // THƯỞNG THƠ
  if (msg === "thưởng thơ") {
    message.reply(`Ngô vàng thơm giữa chiều nay
Gió ru đồng bãi ngất ngây hương đồng
Nướng lên thơm lửa hồng
Chấm thêm muối ớt cay nồng mê say 🌽`);
  }

  // TÀI XỈU
  if (msg.startsWith("taixiu")) {

    const args = msg.split(" ");
    const choice = args[1];

    if (!choice) {
      message.reply("Ví dụ: taixiu tai");
      return;
    }

    const d1 = Math.floor(Math.random()*6)+1;
    const d2 = Math.floor(Math.random()*6)+1;
    const d3 = Math.floor(Math.random()*6)+1;

    const total = d1 + d2 + d3;

    const result = total >= 11 ? "tai" : "xiu";

    if(choice === result){
      money[user] += 50;
      message.reply(`🎉 Bạn thắng!\n🎲 ${d1}|${d2}|${d3}\nTổng: ${total}\n💰 +50 coin`);
    }else{
      money[user] -= 20;
      message.reply(`💀 Bạn thua!\n🎲 ${d1}|${d2}|${d3}\nTổng: ${total}\n💸 -20 coin`);
    }

  }

  // MONEY
  if (msg === "money") {
    message.reply(`💰 Bạn có ${money[user]} coin`);
  }

  // DAILY
  if (msg === "daily") {
    money[user] += 100;
    message.reply("🎁 Bạn nhận 100 coin");
  }

});

client.login(process.env.TOKEN);
