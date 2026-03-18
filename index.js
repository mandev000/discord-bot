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
 intents: [
  GatewayIntentBits.Guilds,
  GatewayIntentBits.GuildMessages,
  GatewayIntentBits.MessageContent
 ]
})

// ===== DATA =====
function load(file){
 return fs.existsSync(file) ? JSON.parse(fs.readFileSync(file)) : {}
}

let money = load("money.json")
let history = []

function save(){
 fs.writeFileSync("money.json", JSON.stringify(money,null,2))
}

client.once("ready",()=>console.log("🔥 CASINO WEB UI ONLINE"))

const cooldown = new Set()

// ===== MESSAGE =====
client.on("messageCreate", async message=>{
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

client.login(process.env.TOKEN)
