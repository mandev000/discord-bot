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
doanso 5
flip

💰 TIỀN
daily
money`);
  }

  // PING
  if (msg === "ping") {
    message.reply("🏓 Pong!");
  }

  // NGOCAY
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

      message.reply(`🎉 Bạn thắng!

🎲 ${d1} | ${d2} | ${d3}
Tổng: ${total}

💰 +50 coin`);

    }else{

      money[user] -= 20;

      message.reply(`💀 Bạn thua!

🎲 ${d1} | ${d2} | ${d3}
Tổng: ${total}

💸 -20 coin`);

    }

  }

  // MONEY
  if (msg === "money") {
    message.reply(`💰 Bạn có ${money[user]} coin`);
  }

  // DAILY
  if (msg === "daily") {
    money[user] += 100;
    message.reply(`🎁 Bạn nhận 100 coin`);
  }

});

client.login(process.env.TOKEN);doanso 1-10
flip

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
      content: "🌽 Ngô Cay",
      files: [
        "https://png.pngtree.com/png-vector/20250918/ourmid/pngtree-hot-steamed-corn-on-cob-served-with-butter-and-masala-seasoning-png-image_17496796.webp"
      ]
    });
  }

  // THƯỞNG THƠ
  if (msg === "thưởng thơ") {
    message.reply(`Ngô vàng thơm giữa chiều nay
Gió nhẹ thổi qua ruộng ngô lay
Hạt vàng nướng lửa thơm bay
Thêm chút ớt cay đậm vị ngày hè.

Cắn vào giòn rụm mê say
Ngọt bùi hòa với chút cay đầu môi
Bạn bè ngồi cạnh cười vui
Thưởng thơ, ăn ngô, đất trời bình yên 🌽🔥`);
  }

  // TÀI XỈU
  if (msg.startsWith("taixiu")) {

    const args = msg.split(" ");
    const choice = args[1];

    if (!choice) return message.reply("🎲 Ví dụ: taixiu tai");

    const d1 = Math.floor(Math.random()*6)+1;
    const d2 = Math.floor(Math.random()*6)+1;
    const d3 = Math.floor(Math.random()*6)+1;

    const total = d1+d2+d3;
    const result = total >= 11 ? "tai" : "xiu";

    if(choice === result){
      money[user] += 50;

      message.reply(`🎉 Bạn thắng!

🎲 ${d1} | ${d2} | ${d3}
📊 Tổng: ${total}
🔥 Kết quả: ${result}

💰 +50 coin`);
    }else{

      money[user] -= 20;

      message.reply(`💀 Bạn thua!

🎲 ${d1} | ${d2} | ${d3}
📊 Tổng: ${total}
🔥 Kết quả: ${result}

💸 -20 coin`);
    }

  }

  // ĐOÁN SỐ
  if(msg.startsWith("doanso")){

    const guess = parseInt(msg.split(" ")[1]);
    const number = Math.floor(Math.random()*10)+1;

    if(!guess) return message.reply("🎯 Ví dụ: doanso 5");

    if(guess === number){

      money[user] += 30;

      message.reply(`🎉 Đúng!

Số là ${number}

💰 +30 coin`);

    }else{

      message.reply(`❌ Sai!

Số đúng là ${number}`);

    }

  }

  // FLIP COIN
  if(msg === "flip"){

    const coin = Math.random() < 0.5 ? "Ngửa" : "Sấp";

    message.reply(`🪙 Đồng xu: ${coin}`);

  }

  // DAILY
  if(msg === "daily"){

    money[user] += 100;

    message.reply(`💰 Bạn nhận 100 coin

Tổng: ${money[user]} coin`);

  }

  // MONEY
  if(msg === "money"){

    message.reply(`💰 Bạn có ${money[user]} coin`);

  }

});

client.login(process.env.TOKEN);
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
