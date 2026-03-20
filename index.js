const {
 Client,
 GatewayIntentBits,
 ActionRowBuilder,
 ButtonBuilder,
 ButtonStyle,
 EmbedBuilder
} = require("discord.js")

const fs = require("fs")

const client = new Client({
 intents:[
  GatewayIntentBits.Guilds,
  GatewayIntentBits.GuildMessages,
  GatewayIntentBits.MessageContent
 ]
})

// ===== LOAD =====
function load(f){
 return fs.existsSync(f)?JSON.parse(fs.readFileSync(f)):{}
}

let money = load("money.json")
let history = load("history.json")
let daily = load("daily.json")
let code = load("code.json")
let vip = load("vip.json")

function save(){
 fs.writeFileSync("money.json",JSON.stringify(money,null,2))
 fs.writeFileSync("history.json",JSON.stringify(history,null,2))
 fs.writeFileSync("daily.json",JSON.stringify(daily,null,2))
 fs.writeFileSync("code.json",JSON.stringify(code,null,2))
 fs.writeFileSync("vip.json",JSON.stringify(vip,null,2))
}

// ===== SYSTEM =====
function getMoney(id){
 if(!money[id]) money[id]=1000
 return money[id]
}

function addMoney(id,amt){
 money[id]=Math.max(0,getMoney(id)+amt)
 save()
}

function addHistory(id,text){
 if(!history[id]) history[id]=[]
 history[id].push(text)
 if(history[id].length>15) history[id].shift()
 save()
}

function rand(min,max){
 return Math.floor(Math.random()*(max-min+1))+min
}

// ===== EVENT X2 =====
function isEvent(){
 let h = new Date().getHours()
 return h>=20 && h<=21
}

// ===== BLACKJACK =====
let bj = {}

function sum(a){ return a.reduce((x,y)=>x+y,0) }
function draw(){ return rand(1,11) }

// ===== READY =====
client.once("ready",()=>console.log("🔥 CASINO FIXED ONLINE"))

// ===== MESSAGE =====
client.on("messageCreate", async (msg)=>{
 if(msg.author.bot) return

 const id = msg.author.id
 const text = msg.content.toLowerCase()
 const args = text.split(" ")

 // ===== HELP =====
 if(text==="help"){
  return msg.reply(`
🎰 CASINO

money | daily
nap <tiền> | code <mã>

slot <tiền>
bj <tiền>
xocdia <tiền>

top
shopvip | buyvip

history
`)
 }

 // ===== MONEY =====
 if(text==="money"){
  return msg.reply(`💰 ${getMoney(id)}$`)
 }

 // ===== DAILY =====
 if(text==="daily"){
  let now = Date.now()
  if(daily[id] && now-daily[id]<86400000)
   return msg.reply("⏳ Chưa đủ 24h")

  daily[id]=now
  addMoney(id,500)
  addHistory(id,"🎁 daily")

  return msg.reply("🎁 +500$")
 }

 // ===== TOP =====
 if(text==="top"){
  let top = Object.entries(money)
   .sort((a,b)=>b[1]-a[1])
   .slice(0,10)

  let txt = top.map((u,i)=>`${i+1}. <@${u[0]}> - ${u[1]}$`).join("\n")
  return msg.reply("🏆 TOP GIÀU\n"+txt)
 }

 // ===== VIP =====
 if(text==="shopvip"){
  return msg.reply("💎 VIP = 50,000$ | buyvip")
 }

 if(text==="buyvip"){
  if(getMoney(id)<50000) return msg.reply("Không đủ tiền")

  vip[id]=true
  addMoney(id,-50000)
  save()

  return msg.reply("💎 VIP ACTIVATED")
 }

 // ===== NẠP =====
 if(text.startsWith("nap")){
  let amt = parseInt(args[1])
  if(!amt || amt<=0) return msg.reply("Nhập số hợp lệ")

  addMoney(id,amt)
  return msg.reply(`💳 +${amt}$`)
 }

 // ===== CODE =====
 if(text.startsWith("code")){
  let c = args[1]?.toUpperCase()
  if(!c || !code[c]) return msg.reply("Code sai")

  let reward = code[c]

  addMoney(id,reward)
  delete code[c]
  save()

  return msg.reply(`💳 +${reward}$`)
 }

 // ===== SLOT =====
 if(text.startsWith("slot")){
  let bet = parseInt(args[1])
  if(!bet || bet<=0) return msg.reply("Nhập tiền hợp lệ")
  if(getMoney(id)<bet) return msg.reply("Không đủ tiền")

  const icons=["🍒","🍋","💎","⭐","7️⃣"]

  const embed = new EmbedBuilder().setTitle("🎰 SLOT")

  let m = await msg.reply({embeds:[embed]})

  for(let i=0;i<5;i++){
   embed.setDescription(
    Array(3).fill().map(()=>icons[rand(0,4)]).join(" | ")
   )
   await m.edit({embeds:[embed]})
   await new Promise(r=>setTimeout(r,150))
  }

  let final = Array(3).fill().map(()=>icons[rand(0,4)])
  let win = Math.random()<0.45

  let reward = bet*(isEvent()?2:1)

  if(win){
   addMoney(id,reward)
   addHistory(id,"🎰 WIN")
  }else{
   addMoney(id,-bet)
   addHistory(id,"💀 LOSE")
  }

  embed.setDescription(final.join(" | ")+"\n"+(win?"🎉 WIN":"💀 LOSE"))
  m.edit({embeds:[embed]})
 }

 // ===== XÓC ĐĨA =====
 if(text.startsWith("xocdia")){
  let bet = parseInt(args[1])
  if(!bet || bet<=0) return msg.reply("Nhập tiền")
  if(getMoney(id)<bet) return msg.reply("Không đủ tiền")

  const embed = new EmbedBuilder().setTitle("🥣 XÓC ĐĨA")
  let m = await msg.reply({embeds:[embed]})

  for(let i=0;i<4;i++){
   embed.setDescription("Đang xóc...")
   await m.edit({embeds:[embed]})
   await new Promise(r=>setTimeout(r,200))
  }

  let red = rand(0,4)
  let win = red>=3 // ~40%

  let reward = bet*(isEvent()?2:1)

  if(win){
   addMoney(id,reward)
   addHistory(id,"🥣 WIN")
  }else{
   addMoney(id,-bet)
   addHistory(id,"💀 LOSE")
  }

  embed.setDescription(`🔴: ${red} | ⚪: ${4-red}\n${win?"WIN":"LOSE"}`)
  m.edit({embeds:[embed]})
 }

 // ===== BLACKJACK =====
 if(text.startsWith("bj")){
  let bet = parseInt(args[1])
  if(!bet || bet<=0) return msg.reply("Nhập tiền")
  if(getMoney(id)<bet) return msg.reply("Không đủ tiền")

  if(bj[id]) return msg.reply("Bạn đang chơi rồi!")

  bj[id]={bet,player:[draw(),draw()],dealer:[draw(),draw()]}

  const row = new ActionRowBuilder().addComponents(
   new ButtonBuilder().setCustomId("hit_"+id).setLabel("HIT").setStyle(ButtonStyle.Primary),
   new ButtonBuilder().setCustomId("stand_"+id).setLabel("STAND").setStyle(ButtonStyle.Success)
  )

  return msg.reply({
   content:`🃏 ${sum(bj[id].player)}`,
   components:[row]
  })
 }

 // ===== HISTORY =====
 if(text==="history"){
  let h = history[id]||[]
  return msg.reply("📊\n"+(h.join("\n")||"Trống"))
 }

})

// ===== BUTTON =====
client.on("interactionCreate", async (i)=>{
 if(!i.isButton()) return

 let [type,uid] = i.customId.split("_")
 if(i.user.id !== uid) return i.reply({content:"Không phải game của bạn",ephemeral:true})

 let g = bj[uid]
 if(!g) return

 if(type==="hit"){
  g.player.push(draw())

  if(sum(g.player)>21){
   addMoney(uid,-g.bet)
   delete bj[uid]
   return i.reply("💀 Quắc")
  }

  return i.reply(`🃏 ${sum(g.player)}`)
 }

 if(type==="stand"){
  while(sum(g.dealer)<17) g.dealer.push(draw())

  let p=sum(g.player), d=sum(g.dealer)
  let win = d>21 || p>d

  if(win){
   addMoney(uid,g.bet*(isEvent()?2:1))
  }else{
   addMoney(uid,-g.bet)
  }

  delete bj[uid]

  return i.reply(`Bạn:${p} | Nhà:${d}\n${win?"WIN":"LOSE"}`)
 }
})

client.login("YOUR_TOKEN")
