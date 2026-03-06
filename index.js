const { Client, GatewayIntentBits, EmbedBuilder } = require("discord.js");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

let money = {};
let lastDaily = {};

client.once("ready", () => {
  console.log("🤖 BOT CASINO ONLINE!");
});

client.on("messageCreate", async (message) => {

  if (message.author.bot) return;

  const msg = message.content.toLowerCase();
  const user = message.author.id;

  if (!money[user]) money[user] = 200;

  // =================
  // HELP
  // =================

  if (msg === "help") {

    const embed = new EmbedBuilder()
    .setTitle("🎮 MENU GAME BOT")
    .setColor("Gold")
    .setDescription(`
📜 **LỆNH**

ping
money
daily
top
ngocay
thưởng thơ

🎲 **CASINO**

taixiu tai
taixiu xiu
coin
dice
slot
blackjack
box
`);

    message.reply({embeds:[embed]});
  }

  // =================
  // PING
  // =================

  if (msg === "ping") {
    message.reply("🏓 Pong!");
  }

  // =================
  // MONEY
  // =================

  if (msg === "money") {

    const embed = new EmbedBuilder()
    .setColor("Green")
    .setTitle("💰 TÀI KHOẢN")
    .setDescription(`Bạn có **${money[user]} coin**`);

    message.reply({embeds:[embed]});
  }

  // =================
  // DAILY
  // =================

  if (msg === "daily") {

    const now = Date.now();

    if(lastDaily[user] && now - lastDaily[user] < 86400000){
      message.reply("⏳ Bạn đã nhận daily hôm nay!");
      return;
    }

    lastDaily[user] = now;

    const reward = Math.floor(Math.random()*200)+100;
    money[user] += reward;

    message.reply(`🎁 Bạn nhận **${reward} coin**`);
  }

  // =================
  // TÀI XỈU
  // =================

  if (msg.startsWith("taixiu")) {

    const args = msg.split(" ");
    const choice = args[1];

    const d1 = Math.floor(Math.random()*6)+1;
    const d2 = Math.floor(Math.random()*6)+1;
    const d3 = Math.floor(Math.random()*6)+1;

    const total = d1+d2+d3;

    const result = total >= 11 ? "tai":"xiu";

    let win = choice === result;

    if(win){
      money[user]+=80;
    }else{
      money[user]-=40;
    }

    const embed = new EmbedBuilder()
    .setColor(win?"Green":"Red")
    .setTitle("🎲 TÀI XỈU")
    .setDescription(`
🎲 ${d1} | ${d2} | ${d3}

Tổng: **${total}**

Kết quả: **${result.toUpperCase()}**

${win?"🎉 Bạn thắng +80":"💀 Bạn thua -40"}
`);

    message.reply({embeds:[embed]});
  }
  // =================
// NGÔ CAY
// =================

if (msg === "ngocay") {

  const embed = new EmbedBuilder()
  .setTitle("🌽 NGÔ CAY")
  .setColor("Orange")
  .setDescription("Ngô cay thơm ngon 🔥")
  .setImage("https://i.imgur.com/9Xn6F6C.png");

  message.reply({embeds:[embed]});
}
  // =================
// THƯỞNG THƠ
// =================

if (msg === "thưởng thơ") {

  const embed = new EmbedBuilder()
  .setTitle("📜 THƯỞNG THƠ")
  .setColor("Purple")
  .setDescription(`
Ngô vàng thơm giữa chiều nay  
Gió ru đồng bãi ngất ngây hương đồng  
Nướng lên thơm lửa hồng  
Chấm thêm muối ớt cay nồng mê say 🌽
`);

  message.reply({embeds:[embed]});
}

  // =================
  // COIN FLIP
  // =================

  if (msg === "coin") {

    const flip = Math.random()<0.5;

    if(flip){
      money[user]+=30;
    }else{
      money[user]-=15;
    }

    message.reply(`🪙 ${flip?"NGỬA":"SẤP"}\n${flip?"💰 +30":"💸 -15"}`);
  }

  // =================
  // DICE
  // =================

  if (msg === "dice") {

    const dice = Math.floor(Math.random()*6)+1;

    if(dice>=4){
      money[user]+=40;
    }else{
      money[user]-=20;
    }

    message.reply(`🎲 Ra **${dice}**\n${dice>=4?"💰 +40":"💸 -20"}`);
  }

  // =================
  // SLOT
  // =================

  if (msg === "slot") {

    const icons = ["🍒","🍋","🍇","💎","7️⃣"];

    const a = icons[Math.floor(Math.random()*icons.length)];
    const b = icons[Math.floor(Math.random()*icons.length)];
    const c = icons[Math.floor(Math.random()*icons.length)];

    if(a===b && b===c){
      money[user]+=200;
      message.reply(`🎰 ${a} | ${b} | ${c}\n🎉 JACKPOT +200`);
    }else{
      money[user]-=30;
      message.reply(`🎰 ${a} | ${b} | ${c}\n💸 -30`);
    }
  }

  // =================
  // BLACKJACK
  // =================

  if (msg === "blackjack") {

    const player = Math.floor(Math.random()*11)+10;
    const dealer = Math.floor(Math.random()*11)+10;

    let text;

    if(player>21){
      money[user]-=40;
      text="💀 Bạn quá 21 thua";
    }
    else if(dealer>21 || player>dealer){
      money[user]+=80;
      text="🎉 Bạn thắng";
    }
    else{
      money[user]-=40;
      text="💸 Dealer thắng";
    }

    message.reply(`🃏 BLACKJACK

Bạn: ${player}
Dealer: ${dealer}

${text}`);
  }

  // =================
  // BOX
  // =================

  if (msg === "box") {

    const reward = Math.floor(Math.random()*300)-100;

    money[user]+=reward;

    message.reply(`🎁 MỞ HỘP

${reward>0?`💰 +${reward}`:`💸 ${reward}`}`);
  }

  // =================
  // TOP
  // =================

  if (msg === "top") {

    const sorted = Object.entries(money)
    .sort((a,b)=>b[1]-a[1])
    .slice(0,5);

    let text="";

    sorted.forEach((u,i)=>{
      text+=`#${i+1} <@${u[0]}> - ${u[1]} coin\n`;
    });

    const embed = new EmbedBuilder()
    .setTitle("🏆 TOP GIÀU NHẤT")
    .setColor("Gold")
    .setDescription(text);

    message.reply({embeds:[embed]});
  }

});

client.login(process.env.TOKEN);
