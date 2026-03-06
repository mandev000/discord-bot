const { Client, GatewayIntentBits, EmbedBuilder } = require("discord.js")
const fs = require("fs")

const client = new Client({
 intents:[
  GatewayIntentBits.Guilds,
  GatewayIntentBits.GuildMessages,
  GatewayIntentBits.MessageContent
 ]
})

let money = fs.existsSync("money.json") ? JSON.parse(fs.readFileSync("money.json")) : {}
let bank = fs.existsSync("bank.json") ? JSON.parse(fs.readFileSync("bank.json")) : {}
let inventory = fs.existsSync("inventory.json") ? JSON.parse(fs.readFileSync("inventory.json")) : {}
let lastDaily = {}

function save(){
 fs.writeFileSync("money.json",JSON.stringify(money,null,2))
 fs.writeFileSync("bank.json",JSON.stringify(bank,null,2))
 fs.writeFileSync("inventory.json",JSON.stringify(inventory,null,2))
}

const shop = {
 pizza:50,
 burger:80,
 cola:30,
 sword:200,
 shield:180,
 car:500,
 phone:250,
 laptop:800,
 vip:1000,
 crate:150
}

client.once("ready",()=>{
 console.log("BOT CASINO ONLINE")
})

client.on("messageCreate", async message=>{

 if(message.author.bot) return

 const msg = message.content.toLowerCase()
 const args = msg.split(" ")
 const user = message.author.id

 if(!money[user]) money[user]=200
 if(!bank[user]) bank[user]=0
 if(!inventory[user]) inventory[user]=[]

 save()

// HELP

if(msg==="help"){

const embed = new EmbedBuilder()
.setColor("Gold")
.setTitle("🎮 CASINO BOT")
.setDescription(`

💰 MONEY
money
daily

🏦 BANK
bank
deposit <số>
withdraw <số>

🎰 GAME
slot
taixiu tai <tiền>
taixiu xiu <tiền>

🎁 ITEM
shop
buy <item>
inventory

🎁 FUN
ngocay
thưởng thơ

🏆 KHÁC
top
`)

message.reply({embeds:[embed]})

}

// MONEY

if(msg==="money"){
message.reply(`💰 ${money[user]} coin`)
}

// DAILY

if(msg==="daily"){

const now = Date.now()

if(lastDaily[user] && now-lastDaily[user]<86400000)
return message.reply("⏳ Đã nhận hôm nay")

lastDaily[user]=now

const reward = Math.floor(Math.random()*200)+100

money[user]+=reward
save()

message.reply(`🎁 Daily +${reward}`)
}

// BANK

if(msg==="bank"){
message.reply(`🏦 Bank: ${bank[user]}`)
}

// DEPOSIT

if(msg.startsWith("deposit")){

const amount = parseInt(args[1])

if(money[user]<amount)
return message.reply("❌ Không đủ tiền")

money[user]-=amount
bank[user]+=amount

save()

message.reply(`🏦 Đã gửi ${amount}`)

}

// WITHDRAW

if(msg.startsWith("withdraw")){

const amount = parseInt(args[1])

if(bank[user]<amount)
return message.reply("❌ Bank không đủ")

bank[user]-=amount
money[user]+=amount

save()

message.reply(`💰 Rút ${amount}`)

}

// SHOP

if(msg==="shop"){

let text=""

for(let item in shop){
 text+=`${item} - ${shop[item]} coin\n`
}

message.reply(`🛒 SHOP\n\n${text}`)

}

// BUY

if(msg.startsWith("buy")){

const item = args[1]

if(!shop[item])
return message.reply("❌ Item không tồn tại")

if(money[user]<shop[item])
return message.reply("❌ Không đủ tiền")

money[user]-=shop[item]

inventory[user].push(item)

save()

message.reply(`🛒 Mua ${item}`)

}

// INVENTORY

if(msg==="inventory"){

if(inventory[user].length===0)
return message.reply("🎒 Kho đồ trống")

message.reply(`🎒\n${inventory[user].join("\n")}`)

}

// SLOT

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
 money[user]+=200
 win=true
}else{
 money[user]-=30
}

save()

m.edit(`🎰 ${a} | ${b} | ${c}\n${win?"🎉 JACKPOT":"💸 -30"}`)

},2000)

}

// TÀI XỈU

if(msg.startsWith("taixiu")){

const bet = parseInt(args[2])
const choice = args[1]

if(money[user]<bet)
return message.reply("❌ Không đủ tiền")

let roll = await message.reply("🎲 Đang lắc...")

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

Kết quả: ${result}

${win?`🎉 +${bet}`:`💀 -${bet}`}
`)

},2000)

}

// TOP

if(msg==="top"){

const sorted = Object.entries(money)
.sort((a,b)=>b[1]-a[1])
.slice(0,5)

let text=""

sorted.forEach((u,i)=>{
text+=`#${i+1} <@${u[0]}> - ${u[1]}\n`
})

message.reply(`🏆 TOP\n\n${text}`)

}

// NGOCAY

if(msg==="ngocay"){

message.reply({
content:"🌽 Ngô cay",
files:["https://i.imgur.com/9Xn6F6C.png"]
})

}

// THƯỞNG THƠ

if(msg==="thưởng thơ"){

message.reply(`

Ngô vàng thơm giữa chiều nay  
Gió ru đồng bãi ngất ngây hương đồng  
Nướng lên thơm lửa hồng  
Chấm thêm muối ớt cay nồng mê say 🌽

`)

}

})

client.login(process.env.TOKEN)
