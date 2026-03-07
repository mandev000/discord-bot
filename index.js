const { Client, GatewayIntentBits, EmbedBuilder } = require("discord.js")
const fs = require("fs")

const client = new Client({
 intents:[
  GatewayIntentBits.Guilds,
  GatewayIntentBits.GuildMessages,
  GatewayIntentBits.MessageContent
 ]
})

// ================= DATA =================

let money = fs.existsSync("money.json") ? JSON.parse(fs.readFileSync("money.json")) : {}
let bank = fs.existsSync("bank.json") ? JSON.parse(fs.readFileSync("bank.json")) : {}
let inventory = fs.existsSync("inventory.json") ? JSON.parse(fs.readFileSync("inventory.json")) : {}
let quest = fs.existsSync("quest.json") ? JSON.parse(fs.readFileSync("quest.json")) : {}
let codes = { free100:100 , vip500:500 }

function save(){
 fs.writeFileSync("money.json",JSON.stringify(money,null,2))
 fs.writeFileSync("bank.json",JSON.stringify(bank,null,2))
 fs.writeFileSync("inventory.json",JSON.stringify(inventory,null,2))
 fs.writeFileSync("quest.json",JSON.stringify(quest,null,2))
}

// ================= SHOP =================

const shop = {

pizza:50,
burger:80,
cola:30,
water:20,
bread:25,

sword:200,
shield:180,
gun:400,

phone:250,
laptop:800,
pc:1200,

car:500,
bike:300,

vip:1000,

crate:150,
supercrate:500,

ring:150,
watch:200,
diamond:600

}

// ================= READY =================

client.once("ready",()=>{
 console.log("🔥 CASINO BOT ONLINE")
})

// ================= BOT =================

client.on("messageCreate", async message=>{

if(message.author.bot) return

const msg = message.content.toLowerCase()
const args = msg.split(" ")
const user = message.author.id

if(!money[user]) money[user]=500
if(!bank[user]) bank[user]=0
if(!inventory[user]) inventory[user]=[]
if(!quest[user]) quest[user]={daily:false}

save()

// ================= HELP =================

if(msg==="help"){

const embed = new EmbedBuilder()

.setColor("Gold")
.setTitle("🎮 CASINO BOT MENU")

.setDescription(`

💰 **TIỀN**
money
daily
redeem <code>

🏦 **BANK**
bank
deposit <số>
withdraw <số>

🎰 **GAME**
slot
taixiu tai <tiền>
taixiu xiu <tiền>
xocdia <tiền>

🎁 **ITEM**
shop
buy <item>
inventory
opencrate

🎯 **NHIỆM VỤ**
quest

🏆 **KHÁC**
top
ngocay
thưởng thơ
`)

message.reply({embeds:[embed]})

}

// ================= MONEY =================

if(msg==="money"){

message.reply(`💰 Bạn có **${money[user]} coin**`)

}

// ================= DAILY =================

if(msg==="daily"){

if(quest[user].daily)
return message.reply("⏳ Hôm nay đã nhận")

let reward = Math.floor(Math.random()*300)+200

money[user]+=reward
quest[user].daily=true

save()

message.reply(`🎁 Daily nhận **${reward} coin**`)

}

// ================= QUEST =================

if(msg==="quest"){

message.reply(`
🎯 NHIỆM VỤ

daily → nhận coin mỗi ngày
slot → chơi slot
taixiu → chơi tài xỉu

Hoàn thành sẽ nhận thưởng
`)

}

// ================= REDEEM =================

if(msg.startsWith("redeem")){

let code = args[1]

if(!codes[code])
return message.reply("❌ Code sai")

money[user]+=codes[code]

delete codes[code]

save()

message.reply(`🎁 Nhận ${codes[code]} coin`)

}

// ================= BANK =================

if(msg==="bank"){

message.reply(`🏦 Bank: **${bank[user]} coin**`)

}

// ================= DEPOSIT =================

if(msg.startsWith("deposit")){

let amount = parseInt(args[1])

if(money[user]<amount)
return message.reply("❌ Không đủ")

money[user]-=amount
bank[user]+=amount

save()

message.reply(`🏦 Gửi **${amount} coin**`)

}

// ================= WITHDRAW =================

if(msg.startsWith("withdraw")){

let amount = parseInt(args[1])

if(bank[user]<amount)
return message.reply("❌ Bank không đủ")

bank[user]-=amount
money[user]+=amount

save()

message.reply(`💰 Rút **${amount} coin**`)

}

// ================= SHOP =================

if(msg==="shop"){

let text=""

for(let item in shop){
text+=`${item} — ${shop[item]} coin\n`
}

message.reply(`🛒 SHOP\n\n${text}`)

}

// ================= BUY =================

if(msg.startsWith("buy")){

let item = args[1]

if(!shop[item])
return message.reply("❌ Item không tồn tại")

if(money[user]<shop[item])
return message.reply("❌ Không đủ tiền")

money[user]-=shop[item]

inventory[user].push(item)

save()

message.reply(`🛒 Đã mua **${item}**`)

}

// ================= INVENTORY =================

if(msg==="inventory"){

if(inventory[user].length===0)
return message.reply("🎒 Kho đồ trống")

message.reply(`🎒 INVENTORY\n\n${inventory[user].join("\n")}`)

}

// ================= CRATE =================

if(msg==="opencrate"){

if(!inventory[user].includes("crate"))
return message.reply("❌ Bạn không có crate")

inventory[user].splice(inventory[user].indexOf("crate"),1)

let reward = Math.floor(Math.random()*500)+100

money[user]+=reward

save()

message.reply(`🎁 Mở crate nhận **${reward} coin**`)

}

// ================= SLOT =================

if(msg==="slot"){

let m = await message.reply("🎰 | ❔ | ❔ | ❔")

setTimeout(()=>m.edit("🎰 | 🍒 | ❔ | ❔"),700)
setTimeout(()=>m.edit("🎰 | 🍒 | 🍋 | ❔"),1400)

setTimeout(()=>{

const icons=["🍒","🍋","🍇","💎","7️⃣"]

const a=icons[Math.floor(Math.random()*icons.length)]
const b=icons[Math.floor(Math.random()*icons.length)]
const c=icons[Math.floor(Math.random()*icons.length)]

let win=false

if(a===b && b===c){
 money[user]+=300
 win=true
}else{
 money[user]-=50
}

save()

m.edit(`🎰 ${a} | ${b} | ${c}\n${win?"🎉 JACKPOT +300":"💸 -50"}`)

},2000)

}

// ================= TÀI XỈU =================

if(msg.startsWith("taixiu")){

const bet=parseInt(args[2])
const choice=args[1]

if(money[user]<bet)
return message.reply("❌ Không đủ tiền")

let roll = await message.reply("🎲 Đang lắc xúc xắc...")

setTimeout(()=>{

const d1=Math.floor(Math.random()*6)+1
const d2=Math.floor(Math.random()*6)+1
const d3=Math.floor(Math.random()*6)+1

const total=d1+d2+d3

const result = total>=11?"tai":"xiu"

let win = choice===result

if(win){
 money[user]+=bet
}else{
 money[user]-=bet
}

save()

roll.edit(`
🎲 ${d1} | ${d2} | ${d3}

Tổng: ${total}

Kết quả: **${result}**

${win?`🎉 +${bet}`:`💀 -${bet}`}
`)

},2000)

}

// ================= XÓC ĐĨA =================

if(msg.startsWith("xocdia")){

const bet=parseInt(args[1])

if(money[user]<bet)
return message.reply("❌ Không đủ tiền")

let roll = await message.reply("🥣 Đang xóc...")

setTimeout(()=>{

let reds=0

for(let i=0;i<4;i++){
 if(Math.random()<0.5) reds++
}

let white = 4-reds

let result = reds>white?"đỏ":"trắng"

let win = Math.random()<0.5

if(win){
 money[user]+=bet
}else{
 money[user]-=bet
}

save()

roll.edit(`

🎯 KẾT QUẢ XÓC ĐĨA

🔴 ${reds} đỏ
⚪ ${white} trắng

${win?`🎉 Thắng +${bet}`:`💀 Thua -${bet}`}

`)

},2500)

}

// ================= TOP =================

if(msg==="top"){

const sorted = Object.entries(money)
.sort((a,b)=>b[1]-a[1])
.slice(0,5)

let text=""

sorted.forEach((u,i)=>{
text+=`#${i+1} <@${u[0]}> - ${u[1]} coin\n`
})

message.reply(`🏆 TOP GIÀU NHẤT\n\n${text}`)

}

// ================= NGOCAY =================

if(msg==="ngocay"){

message.reply({
content:"🌽 Ngô cay siêu ngon",
files:["https://i.imgur.com/9Xn6F6C.png"]
})

}

// ================= THƯỞNG THƠ =================

if(msg==="thưởng thơ"){

message.reply(`

🌽 Ngô vàng thơm giữa chiều nay  
Gió ru đồng bãi ngất ngây hương đồng  
Nướng lên thơm lửa hồng  
Chấm thêm muối ớt cay nồng mê say 🌽

`)

}

})

client.login(process.env.TOKEN)
