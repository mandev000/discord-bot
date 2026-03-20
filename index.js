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

client.login("YOUR_TOKEN")}

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
 return h>=20 && h<=21 // 20h-21h x2
}

// ===== BLACKJACK =====
let bj = {}

function sum(a){ return a.reduce((x,y)=>x+y,0) }
function draw(){ return rand(1,11) }

// ===== READY =====
client.once("ready",()=>console.log("🔥 CASINO FINAL V2 ONLINE"))

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
shopvip
buyvip

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

 // ===== SHOP VIP =====
 if(text==="shopvip"){
  return msg.reply(`
💎 VIP SHOP
VIP = 50,000$
gõ: buyvip
`)
 }

 if(text==="buyvip"){
  if(getMoney(id)<50000) return msg.reply("Không đủ tiền")

  vip[id]=true
  addMoney(id,-50000)

  return msg.reply("💎 Bạn đã mua VIP!")
 }

 // ===== NẠP =====
 if(text.startsWith("nap")){
  let amt = parseInt(args[1])
  addMoney(id,amt)
  return msg.reply(`💳 +${amt}$`)
 }

 // ===== CODE =====
 if(text.startsWith("code")){
  let c = args[1]?.toUpperCase()
  if(!code[c]) return msg.reply("Code sai")

  addMoney(id,code[c])
  delete code[c]
  save()

  return msg.reply(`💳 +${code[c]}$`)
 }

 // ===== SLOT =====
 if(text.startsWith("slot")){
  let bet = parseInt(args[1])
  if(getMoney(id)<bet) return msg.reply("Không đủ tiền")

  const icons=["🍒","🍋","💎","⭐","7️⃣"]

  const embed = new EmbedBuilder().setTitle("🎰 SLOT")

  let m = await msg.reply({embeds:[embed]})

  for(let i=0;i<5;i++){
   embed.setDescription(
    Array(3).fill().map(()=>icons[rand(0,4)]).join(" | ")
   )
   await m.edit({embeds:[embed]})
   await new Promise(r=>setTimeout(r,200))
  }

  let win = Math.random()<0.45
  let reward = bet*(isEvent()?2:1)

  if(win){
   addMoney(id,reward)
   addHistory(id,"🎰 win")
  }else{
   addMoney(id,-bet)
   addHistory(id,"💀 lose")
  }

  embed.setDescription(win?"🎉 WIN":"💀 LOSE")
  m.edit({embeds:[embed]})
 }

 // ===== XÓC ĐĨA =====
 if(text.startsWith("xocdia")){
  let bet = parseInt(args[1])
  if(getMoney(id)<bet) return msg.reply("Không đủ tiền")

  const embed = new EmbedBuilder().setTitle("🥣 XÓC ĐĨA")

  let m = await msg.reply({embeds:[embed]})

  let anim = ["⚪⚪⚪⚪","🔴⚪🔴⚪","⚪🔴⚪🔴"]

  for(let a of anim){
   embed.setDescription("Đang xóc...\n"+a)
   await m.edit({embeds:[embed]})
   await new Promise(r=>setTimeout(r,300))
  }

  let red = rand(0,4)
  let win = red>=3

  if(win){
   addMoney(id,bet*(isEvent()?2:1))
   addHistory(id,"🥣 win")
  }else{
   addMoney(id,-bet)
   addHistory(id,"💀 lose")
  }

  embed.setDescription(`KQ: ${red} đỏ\n${win?"WIN":"LOSE"}`)
  m.edit({embeds:[embed]})
 }

 // ===== BLACKJACK =====
 if(text.startsWith("bj")){
  let bet = parseInt(args[1])
  if(getMoney(id)<bet) return msg.reply("Không đủ tiền")

  bj[id]={bet,player:[draw(),draw()],dealer:[draw(),draw()]}

  const row = new ActionRowBuilder().addComponents(
   new ButtonBuilder().setCustomId("hit").setLabel("HIT").setStyle(ButtonStyle.Primary),
   new ButtonBuilder().setCustomId("stand").setLabel("STAND").setStyle(ButtonStyle.Success)
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

 let id = i.user.id
 if(!bj[id]) return

 let g = bj[id]

 if(i.customId==="hit"){
  g.player.push(draw())

  if(sum(g.player)>21){
   addMoney(id,-g.bet)
   delete bj[id]
   return i.reply("💀 Quắc")
  }

  return i.reply(`🃏 ${sum(g.player)}`)
 }

 if(i.customId==="stand"){
  while(sum(g.dealer)<17) g.dealer.push(draw())

  let p=sum(g.player), d=sum(g.dealer)
  let win = d>21 || p>d

  if(win){
   addMoney(id,g.bet*(isEvent()?2:1))
  }else{
   addMoney(id,-g.bet)
  }

  delete bj[id]

  return i.reply(`Bạn:${p} | Nhà:${d}\n${win?"WIN":"LOSE"}`)
 }
})

client.login("YOUR_TOKEN")client.on("messageCreate", async message=>{
 if(message.author.bot) return

 const msg = message.content.toLowerCase()
 const args = msg.split(" ")
 const user = message.author.id

 if(!money[user]) money[user]=500

 if(cooldown.has(user)) return
 cooldown.add(user)
 setTimeout(()=>cooldown.delete(user),1000)

 // ===== MENU =====
 if(msg==="menu"){

  const row = new ActionRowBuilder().addComponents(
   new ButtonBuilder().setCustomId("slot_ui").setLabel("🎰 Slot").setStyle(ButtonStyle.Primary),
   new ButtonBuilder().setCustomId("xocdia_ui").setLabel("🥣 Bầu Cua").setStyle(ButtonStyle.Success),
   new ButtonBuilder().setCustomId("fun_ui").setLabel("🌽 Fun").setStyle(ButtonStyle.Secondary)
  )

  const embed = new EmbedBuilder()
   .setColor("Gold")
   .setTitle("🎮 CASINO ONLINE")
   .setDescription("Chọn game bên dưới 👇")
   .setImage("https://i.imgur.com/9Xn6F6C.png")

  return message.reply({embeds:[embed],components:[row]})
 }

 // ===== NGÔ CAY =====
 if(msg==="ngocay"){
  return message.reply({
   content:"🌽 Ngô cay siêu ngon 🔥",
   files:["https://i.imgur.com/9Xn6F6C.png"]
  })
 }

 // ===== THƠ =====
 if(msg==="thưởng thơ" || msg==="thuong tho"){
  return message.reply(`
🌽 Ngô vàng thơm giữa chiều nay  
Gió ru đồng bãi ngất ngây hương đồng  
Nướng lên thơm lửa hồng  
Chấm thêm muối ớt cay nồng mê say 🌽`)
 }

})

// ===== BUTTON =====
client.on("interactionCreate", async i=>{
 if(!i.isButton()) return

 const user = i.user.id
 if(!money[user]) money[user]=500

 // ===== SLOT UI =====
 if(i.customId==="slot_ui"){

  const bet = 100

  let msg = await i.reply({content:"🎰 Đang quay...",fetchReply:true})

  const icons=["🍒","🍋","💎","7️⃣"]

  let spin=setInterval(()=>{
   msg.edit(`🎰 ${icons.sort(()=>Math.random()-0.5).slice(0,3).join(" | ")}`)
  },120)

  setTimeout(()=>{
   clearInterval(spin)

   let [a,b,c]=icons.sort(()=>Math.random()-0.5)
   let win = a===b && b===c

   if(win) money[user]+=90
   else money[user]-=bet

   history.push(win?"🟢":"🔴")
   if(history.length>10) history.shift()

   save()

   const embed=new EmbedBuilder()
    .setColor(win?"Green":"Red")
    .setTitle("🎰 SLOT MACHINE")
    .setDescription(`
${a} | ${b} | ${c}

${win?"🎉 WIN +90":"💀 LOSE -100"}
`)
    .addFields({
     name:"📊 Lịch sử",
     value:history.join(" ")
    })

   msg.edit({content:"",embeds:[embed]})

  },2000)
 }

 // ===== XÓC ĐĨA UI =====
 if(i.customId==="xocdia_ui"){

  const bet=100

  let msg=await i.reply({content:"🥣 Đang lắc...",fetchReply:true})

  let frames=["⚪⚪⚪⚪","🔴⚪⚪⚪","🔴🔴⚪⚪","🔴🔴🔴⚪"]

  let index=0
  let anim=setInterval(()=>{
   msg.edit(`🥣 ${frames[index%frames.length]}`)
   index++
  },200)

  setTimeout(()=>{
   clearInterval(anim)

   let reds=0
   for(let i=0;i<4;i++){
    if(Math.random()<0.5) reds++
   }

   let white=4-reds
   let win=Math.random()<0.5

   if(win) money[user]+=95
   else money[user]-=bet

   history.push(win?"🟢":"🔴")
   if(history.length>10) history.shift()

   save()

   const embed=new EmbedBuilder()
    .setColor(win?"Green":"Red")
    .setTitle("🥣 BẦU CUA")
    .setDescription(`
🔴 ${reds} đỏ
⚪ ${white} trắng

${win?"🎉 WIN +95":"💀 LOSE -100"}
`)
    .addFields({
     name:"📊 Lịch sử",
     value:history.join(" ")
    })
    .setImage("https://i.imgur.com/9Xn6F6C.png")

   msg.edit({content:"",embeds:[embed]})

  },2000)
 }

 // ===== FUN MENU =====
 if(i.customId==="fun_ui"){

  const row=new ActionRowBuilder().addComponents(
   new ButtonBuilder().setCustomId("ngocay").setLabel("🌽 Ngô cay").setStyle(ButtonStyle.Success),
   new ButtonBuilder().setCustomId("tho").setLabel("📜 Thơ").setStyle(ButtonStyle.Primary)
  )

  return i.reply({content:"🎉 FUN MENU",components:[row]})
 }

 // ===== NGÔ CAY BUTTON =====
 if(i.customId==="ngocay"){
  return i.reply({
   content:"🌽 Ngô cay siêu ngon 🔥",
   files:["https://i.imgur.com/9Xn6F6C.png"]
  })
 }

 // ===== THƠ BUTTON =====
 if(i.customId==="tho"){
  return i.reply(`
🌽 Ngô vàng thơm giữa chiều nay  
Gió ru đồng bãi ngất ngây hương đồng  
Nướng lên thơm lửa hồng  
Chấm thêm muối ớt cay nồng mê say 🌽`)
 }

})

client.login(process.env.TOKEN)// ===== MESSAGE =====
client.on("messageCreate", async message=>{

 if(message.author.bot) return

 const msg = message.content.toLowerCase()
 const args = msg.split(" ")
 const user = message.author.id

 if(!money[user]) money[user]=500

 if(cooldown.has(user)) return
 cooldown.add(user)
 setTimeout(()=>cooldown.delete(user),1500)

 // ===== HELP =====
 if(msg==="help"){
  return message.reply(`
🎰 CASINO REAL

money
slot <tiền>
taixiu tai/xiu <tiền>
xocdia <tiền>

menu
menufun
`)
 }

 // ===== MONEY =====
 if(msg==="money"){
  return message.reply(`💰 ${money[user]} coin`)
 }

 // ===== MENU =====
 if(msg==="menu"){
  const row = new ActionRowBuilder().addComponents(
   new ButtonBuilder().setCustomId("slot").setLabel("🎰 Slot").setStyle(ButtonStyle.Primary),
   new ButtonBuilder().setCustomId("xocdia").setLabel("🥣 Xóc Đĩa").setStyle(ButtonStyle.Success)
  )

  return message.reply({content:"🎮 MENU GAME",components:[row]})
 }

 // ===== MENU FUN =====
 if(msg==="menufun"){
  const row = new ActionRowBuilder().addComponents(
   new ButtonBuilder().setCustomId("ngocay").setLabel("🌽 Ngô cay").setStyle(ButtonStyle.Success),
   new ButtonBuilder().setCustomId("tho").setLabel("📜 Thưởng thơ").setStyle(ButtonStyle.Primary)
  )

  return message.reply({content:"🎉 FUN MENU",components:[row]})
 }

 // ===== SLOT =====
 if(msg.startsWith("slot")){

  let bet = parseInt(args[1])

  if(isNaN(bet)||bet<=0) return message.reply("❌ slot <tiền>")
  if(money[user]<bet) return message.reply("❌ Không đủ tiền")

  const icons=["🍒","🍋","💎","7️⃣"]

  let m = await message.reply("🎰 Đang quay...")

  let spin = setInterval(()=>{
   m.edit(`🎰 ${icons.sort(()=>Math.random()-0.5).slice(0,3).join(" | ")}`)
  },120)

  setTimeout(()=>{

   clearInterval(spin)

   let [a,b,c]=icons.sort(()=>Math.random()-0.5)

   let win = a===b && b===c

   if(win){
    money[user]+=Math.floor(bet*0.9) // house edge
   }else{
    money[user]-=bet
   }

   save()

   const embed = new EmbedBuilder()
    .setColor(win?"Green":"Red")
    .setTitle("🎰 SLOT")
    .setDescription(`
${a} | ${b} | ${c}

${win?`🎉 +${Math.floor(bet*0.9)}`:`💀 -${bet}`}
`)

   m.edit({content:"",embeds:[embed]})

  },2000)
 }

 // ===== TÀI XỈU =====
 if(msg.startsWith("taixiu")){

  let choice=args[1]
  let bet=parseInt(args[2])

  if(!["tai","xiu"].includes(choice)) return
  if(isNaN(bet)||money[user]<bet) return

  let total=Math.floor(Math.random()*18)+3
  let result= total>=11?"tai":"xiu"

  let win = choice===result

  if(win){
   money[user]+=Math.floor(bet*0.95)
  }else{
   money[user]-=bet
  }

  save()

  message.reply(`
🎲 ${total} → ${result}

${win?`🎉 +${Math.floor(bet*0.95)}`:`💀 -${bet}`}
`)
 }

 // ===== XÓC ĐĨA =====
 if(msg.startsWith("xocdia")){

  let bet=parseInt(args[1])

  if(isNaN(bet)||money[user]<bet) return

  let msgRoll = await message.reply("🥣 Đang xóc...")

  setTimeout(()=>{

   let reds=0
   for(let i=0;i<4;i++){
    if(Math.random()<0.5) reds++
   }

   let white=4-reds
   let win = Math.random()<0.5

   if(win){
    money[user]+=Math.floor(bet*0.95)
   }else{
    money[user]-=bet
   }

   save()

   const embed = new EmbedBuilder()
    .setColor(win?"Green":"Red")
    .setTitle("🥣 XÓC ĐĨA")
    .setDescription(`
🔴 ${reds} đỏ
⚪ ${white} trắng

${win?`🎉 +${Math.floor(bet*0.95)}`:`💀 -${bet}`}
`)

   msgRoll.edit({content:"",embeds:[embed]})

  },2000)
 }

 // ===== NGÔ CAY =====
 if(msg==="ngocay"){
  return message.reply({
   content:"🌽 Ngô cay siêu ngon 🔥",
   files:["https://i.imgur.com/9Xn6F6C.png"]
  })
 }

 // ===== THƯỞNG THƠ =====
 if(msg==="thưởng thơ" || msg==="thuong tho"){
  return message.reply(`
🌽 Ngô vàng thơm giữa chiều nay  
Gió ru đồng bãi ngất ngây hương đồng  
Nướng lên thơm lửa hồng  
Chấm thêm muối ớt cay nồng mê say 🌽`)
 }

})

// ===== BUTTON =====
client.on("interactionCreate", async i=>{

 if(!i.isButton()) return

 const user=i.user.id
 if(!money[user]) money[user]=500

 // SLOT BUTTON
 if(i.customId==="slot"){
  return i.reply("👉 Dùng: slot <tiền>")
 }

 // XOCDIA BUTTON
 if(i.customId==="xocdia"){
  return i.reply("👉 Dùng: xocdia <tiền>")
 }

 // FUN
 if(i.customId==="ngocay"){
  return i.reply({
   content:"🌽 Ngô cay siêu ngon 🔥",
   files:["https://i.imgur.com/9Xn6F6C.png"]
  })
 }

 if(i.customId==="tho"){
  return i.reply("🌽 Ngô vàng thơm giữa chiều nay...")
 }

})

client.login("YOUR_TOKEN")
