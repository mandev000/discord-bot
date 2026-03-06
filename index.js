const { Client, GatewayIntentBits, EmbedBuilder } = require("discord.js");
const fs = require("fs");

const client = new Client({
  intents:[
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

// =================
// LOAD DATA
// =================

let money = fs.existsSync("money.json") ? JSON.parse(fs.readFileSync("money.json")) : {};
let bank = fs.existsSync("bank.json") ? JSON.parse(fs.readFileSync("bank.json")) : {};
let inventory = fs.existsSync("inventory.json") ? JSON.parse(fs.readFileSync("inventory.json")) : {};
let codes = fs.existsSync("codes.json") ? JSON.parse(fs.readFileSync("codes.json")) : {};
let daily = fs.existsSync("daily.json") ? JSON.parse(fs.readFileSync("daily.json")) : {};

function save(){
  fs.writeFileSync("money.json",JSON.stringify(money,null,2));
  fs.writeFileSync("bank.json",JSON.stringify(bank,null,2));
  fs.writeFileSync("inventory.json",JSON.stringify(inventory,null,2));
  fs.writeFileSync("codes.json",JSON.stringify(codes,null,2));
  fs.writeFileSync("daily.json",JSON.stringify(daily,null,2));
}

// =================
// SHOP
// =================

const shop = {
  pizza:50,
  burger:80,
  car:500,
  vip:1000
};

// =================

client.once("ready",()=>{
  console.log("🤖 CASINO BOT ONLINE");
});

// =================

client.on("messageCreate", async(message)=>{

if(message.author.bot) return;

const msg = message.content.toLowerCase();
const args = msg.split(" ");
const user = message.author.id;

if(!money[user]) money[user] = 200;
if(!bank[user]) bank[user] = 0;
if(!inventory[user]) inventory[user] = [];

save();

// =================
// HELP
// =================

if(msg==="help"){

const embed = new EmbedBuilder()
.setColor("Gold")
.setTitle("🎰 CASINO BOT")
.setDescription(`

💰 **TIỀN**

money
bank
deposit <số>
withdraw <số>
daily

🎲 **GAME**

taixiu tai
taixiu xiu
slot

🛒 **SHOP**

shop
buy <item>

🎁 **CODE**

redeem <code>

👑 **ADMIN**

addcode <code> <tiền>

🎒 **KHÁC**

inventory
top
ngocay
thưởng thơ
`);

message.reply({embeds:[embed]});
}

// =================
// MONEY
// =================

if(msg==="money"){

const embed = new EmbedBuilder()
.setColor("Green")
.setTitle("💰 TÀI KHOẢN")
.setDescription(`Bạn có **${money[user]} coin**`);

message.reply({embeds:[embed]});
}

// =================
// BANK
// =================

if(msg==="bank"){

const embed = new EmbedBuilder()
.setColor("Blue")
.setTitle("🏦 BANK")
.setDescription(`Bank: **${bank[user]} coin**`);

message.reply({embeds:[embed]});
}

// =================
// DAILY
// =================

if(msg==="daily"){

const now = Date.now();

if(daily[user] && now - daily[user] < 86400000)
return message.reply("⏳ Bạn đã nhận daily hôm nay!");

daily[user] = now;

let reward = 200;

if(inventory[user].includes("vip"))
reward = 400;

money[user]+=reward;

save();

message.reply(`🎁 Bạn nhận **${reward} coin**`);
}

// =================
// DEPOSIT
// =================

if(msg.startsWith("deposit")){

const amount = parseInt(args[1]);

if(!amount) return message.reply("deposit <số>");

if(money[user] < amount)
return message.reply("❌ Không đủ tiền");

money[user]-=amount;
bank[user]+=amount;

save();

message.reply(`🏦 Đã gửi ${amount}`);
}

// =================
// WITHDRAW
// =================

if(msg.startsWith("withdraw")){

const amount = parseInt(args[1]);

if(!amount) return message.reply("withdraw <số>");

if(bank[user] < amount)
return message.reply("❌ Bank không đủ");

bank[user]-=amount;
money[user]+=amount;

save();

message.reply(`💰 Rút ${amount}`);
}

// =================
// SHOP
// =================

if(msg==="shop"){

let text="";

for(let item in shop){
text+=`**${item}** - ${shop[item]} coin\n`;
}

const embed = new EmbedBuilder()
.setColor("Orange")
.setTitle("🛒 SHOP")
.setDescription(text);

message.reply({embeds:[embed]});
}

// =================
// BUY
// =================

if(msg.startsWith("buy")){

const item = args[1];

if(!shop[item])
return message.reply("❌ Item không tồn tại");

if(money[user] < shop[item])
return message.reply("❌ Không đủ tiền");

money[user]-=shop[item];

inventory[user].push(item);

save();

message.reply(`🛒 Bạn đã mua **${item}**`);
}

// =================
// INVENTORY
// =================

if(msg==="inventory"){

if(inventory[user].length===0)
return message.reply("🎒 Kho đồ trống");

message.reply(`🎒 Kho đồ\n\n${inventory[user].join("\n")}`);
}

// =================
// SLOT
// =================

if(msg==="slot"){

const icons=["🍒","🍋","🍇","💎","7️⃣"];

const a = icons[Math.floor(Math.random()*icons.length)];
const b = icons[Math.floor(Math.random()*icons.length)];
const c = icons[Math.floor(Math.random()*icons.length)];

let win=false;

if(a===b && b===c){
money[user]+=200;
win=true;
}else{
money[user]-=30;
}

save();

message.reply(`🎰 ${a} | ${b} | ${c}\n${win?"🎉 JACKPOT +200":"💸 -30"}`);
}

// =================
// TÀI XỈU
// =================

if(msg.startsWith("taixiu")){

const choice = args[1];

const d1=Math.floor(Math.random()*6)+1;
const d2=Math.floor(Math.random()*6)+1;
const d3=Math.floor(Math.random()*6)+1;

const total=d1+d2+d3;

const result = total>=11 ? "tai":"xiu";

let win = choice===result;

if(win){
money[user]+=80;
}else{
money[user]-=40;
}

save();

message.reply(`🎲 ${d1}|${d2}|${d3}\nKết quả: ${result}\n${win?"🎉 Thắng +80":"💀 Thua -40"}`);
}

// =================
// REDEEM CODE
// =================

if(msg.startsWith("redeem")){

const code = args[1];

if(!codes[code])
return message.reply("❌ Code không tồn tại");

money[user]+=codes[code];

delete codes[code];

save();

message.reply(`🎁 Bạn nhận **${codes[code]} coin**`);
}

// =================
// ADD CODE (ADMIN)
// =================

if(msg.startsWith("addcode")){

if(message.author.id !== "1031563204360409158")
return;

const code = args[1];
const reward = parseInt(args[2]);

codes[code] = reward;

save();

message.reply(`✅ Đã tạo code **${code}**`);
}

// =================
// TOP
// =================

if(msg==="top"){

const sorted = Object.entries(money)
.sort((a,b)=>b[1]-a[1])
.slice(0,5);

let text="";

sorted.forEach((u,i)=>{
text+=`#${i+1} <@${u[0]}> - ${u[1]} coin\n`;
});

message.reply(`🏆 TOP GIÀU\n\n${text}`);
}

// =================
// NGOCAY
// =================

if(msg==="ngocay"){

message.reply({
content:"🌽 Ngô cay",
files:["https://i.imgur.com/9Xn6F6C.png"]
});

}

// =================
// THƯỞNG THƠ
// =================

if(msg==="thưởng thơ"){

message.reply(`

Ngô vàng thơm giữa chiều nay  
Gió ru đồng bãi ngất ngây hương đồng  
Nướng lên thơm lửa hồng  
Chấm thêm muối ớt cay nồng mê say 🌽

`);

}

});

// =================

client.login(process.env.TOKEN);
