// 🚀 GOD MODE CASINO BOT - FULL SYSTEM 🚀 // Features: economy, bank, xp/level, shop, crate, supercrate, trade, marketplace, vip, cooldown, animation, anti cheat

const { Client, GatewayIntentBits } = require("discord.js") 
const fs = require("fs")

const client = new Client({ intents:[ GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent ] })

// ================= LOAD =================

function load(file){ return fs.existsSync(file)?JSON.parse(fs.readFileSync(file)):{} }

let money=load("money.json") let bank=load("bank.json") let inventory=load("inventory.json") let xp=load("xp.json") let market=load("market.json")

function save(){ fs.writeFileSync("money.json",JSON.stringify(money,null,2)) fs.writeFileSync("bank.json",JSON.stringify(bank,null,2)) fs.writeFileSync("inventory.json",JSON.stringify(inventory,null,2)) fs.writeFileSync("xp.json",JSON.stringify(xp,null,2)) fs.writeFileSync("market.json",JSON.stringify(market,null,2)) }

// ================= CONFIG =================

const shop={crate:150,supercrate:500,vip:2000} const cooldown=new Set()

client.once("ready",()=>console.log("🔥 GOD MODE ONLINE"))

client.on("messageCreate",async message=>{ if(message.author.bot) return

const msg=message.content.toLowerCase() const args=msg.split(" ") const user=message.author.id

// cooldown if(cooldown.has(user)) return cooldown.add(user) setTimeout(()=>cooldown.delete(user),1500)

// init if(!money[user]) money[user]=500 if(!bank[user]) bank[user]=0 if(!inventory[user]) inventory[user]=[] if(!xp[user]) xp[user]={xp:0,level:1}

// ================= XP =================

function addXP(u,a){ xp[u].xp+=a if(xp[u].xp>=xp[u].level*100){ xp[u].xp=0 xp[u].level++ message.reply(🎉 LEVEL UP ${xp[u].level}) } }

// ================= BASIC =================

if(msg==="help"){ message.reply(💎 GOD MODE\nmoney bank level\nslot taixiu xocdia\nshop buy inventory\nopencrate opensuper\ndeposit withdraw\ntrade market sell buyitem\ntop) }

if(msg==="money") message.reply(💰 ${money[user]}) if(msg==="level") message.reply(⭐ ${xp[user].level} (${xp[user].xp})) if(msg==="bank") message.reply(🏦 ${bank[user]})

// ================= BANK =================

if(msg.startsWith("deposit")){ let a=parseInt(args[1]) if(isNaN(a)||a<=0||money[user]<a) return money[user]-=a; bank[user]+=a; save() message.reply(🏦 +${a}) }

if(msg.startsWith("withdraw")){ let a=parseInt(args[1]) if(isNaN(a)||a<=0||bank[user]<a) return bank[user]-=a; money[user]+=a; save() message.reply(💰 +${a}) }

// ================= SHOP =================

if(msg==="shop") message.reply(crate 150\nsupercrate 500\nvip 2000)

if(msg.startsWith("buy")){ let item=args[1] if(!shop[item]||money[user]<shop[item]) return money[user]-=shop[item] inventory[user].push(item) addXP(user,5) save() message.reply(🛒 ${item}) }

// ================= INVENTORY =================

if(msg==="inventory") message.reply(inventory[user].join(", ")||"trống")

// ================= CRATE =================

if(msg==="opencrate"){ if(!inventory[user].includes("crate")) return inventory[user].splice(inventory[user].indexOf("crate"),1) let r=Math.floor(Math.random()*300)+100 money[user]+=r; addXP(user,10); save() message.reply(🎁 ${r}) }

if(msg==="opensuper"){ if(!inventory[user].includes("supercrate")) return inventory[user].splice(inventory[user].indexOf("supercrate"),1) let r=Math.floor(Math.random()*1000)+500 money[user]+=r; addXP(user,20); save() message.reply(💎 ${r}) }

// ================= SLOT =================

if(msg==="slot"){ const icons=["🍒","🍋","💎","7️⃣"] let m=await message.reply("🎰 spinning...")

let spin=setInterval(()=>{ m.edit(🎰 ${icons.sort(()=>Math.random()-0.5).slice(0,3).join("|")}) },120)

setTimeout(()=>{ clearInterval(spin) let [a,b,c]=icons.sort(()=>Math.random()-0.5) let win=a===b&&b===c if(win){ money[user]+=500; addXP(user,15) } else money[user]-=50 save() m.edit(${a}|${b}|${c} ${win?"🎉":"💀"}) },2000) }

// ================= TAIXIU =================

if(msg.startsWith("taixiu")){ let bet=parseInt(args[2]) let choice=args[1] if(isNaN(bet)||money[user]<bet) return

let total=Math.floor(Math.random()*18)+3 let result=total>=11?"tai":"xiu"

if(choice===result){ money[user]+=bet; addXP(user,10) } else money[user]-=bet

save() message.reply(${total} => ${result}) }

// ================= XOCDIA =================

if(msg.startsWith("xocdia")){ let bet=parseInt(args[1]) if(isNaN(bet)||money[user]<bet) return

let win=Math.random()<0.5 if(win){ money[user]+=bet; addXP(user,10) } else money[user]-=bet

save() message.reply(win?"🎉":"💀") }

// ================= TRADE =================

if(msg.startsWith("trade")){ let target=message.mentions.users.first() let item=args[2] if(!target||!inventory[user].includes(item)) return

inventory[user].splice(inventory[user].indexOf(item),1) if(!inventory[target.id]) inventory[target.id]=[] inventory[target.id].push(item)

save() message.reply(🔁 traded ${item}) }

// ================= MARKET =================

if(msg.startsWith("sell")){ let item=args[1] let price=parseInt(args[2]) if(!inventory[user].includes(item)||isNaN(price)) return

inventory[user].splice(inventory[user].indexOf(item),1) if(!market[item]) market[item]=[] market[item].push({seller:user,price})

save() message.reply(📦 listed ${item} ${price}) }

if(msg==="market"){ let text="" for(let item in market){ market[item].forEach((m,i)=>{ text+=${item} - ${m.price} (<@${m.seller}>)\n }) } message.reply(text||"trống") }

if(msg.startsWith("buyitem")){ let item=args[1] if(!market[item]||market[item].length===0) return

let data=market[item].shift() if(money[user]<data.price) return

money[user]-=data.price if(!inventory[user]) inventory[user]=[] inventory[user].push(item)

money[data.seller]+=data.price

save() message.reply(🛒 bought ${item}) }

// ================= TOP =================

if(msg==="top"){ let top=Object.entries(money).sort((a,b)=>b[1]-a[1]).slice(0,5) message.reply(top.map((u,i)=>#${i+1} <@${u[0]}> ${u[1]}).join("\n")) }

// ================= BUTTON UI =================

const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js")

if(msg==="menu"){

const row = new ActionRowBuilder().addComponents( new ButtonBuilder().setCustomId("slot").setLabel("🎰 Slot").setStyle(ButtonStyle.Primary), new ButtonBuilder().setCustomId("taixiu").setLabel("🎲 Tài Xỉu").setStyle(ButtonStyle.Success), new ButtonBuilder().setCustomId("xocdia").setLabel("🥣 Xóc Đĩa").setStyle(ButtonStyle.Danger) )

message.reply({content:"🎮 MENU GAME",components:[row]}) }

client.on("interactionCreate", async interaction=>{ if(!interaction.isButton()) return

const user = interaction.user.id

if(!money[user]) money[user]=500

// SLOT BUTTON if(interaction.customId==="slot"){ const icons=["🍒","🍋","💎","7️⃣"] let spin=setInterval(()=>{ interaction.update({content:🎰 ${icons.sort(()=>Math.random()-0.5).slice(0,3).join("|")},components:[]}) },120)

setTimeout(()=>{ clearInterval(spin) let [a,b,c]=icons.sort(()=>Math.random()-0.5) let win=a===b&&b===c

if(win){ money[user]+=500 } else money[user]-=50

save()

interaction.editReply({content:${a}|${b}|${c} ${win?"🎉":"💀"},components:[]}) },2000) }

// TAIXIU BUTTON (random) if(interaction.customId==="taixiu"){ let total=Math.floor(Math.random()*18)+3 let result=total>=11?"TÀI":"XỈU"

interaction.update({content:🎲 ${total} => ${result},components:[]}) }

// XOCDIA BUTTON if(interaction.customId==="xocdia"){ let win=Math.random()<0.5 interaction.update({content:win?"🥣 🎉 WIN":"🥣 💀 LOSE",components:[]}) }

})

})

// ================= FUN (NGÔ CAY + THƯỞNG THƠ) =================

// Text command if(msg==="ngocay"){ message.reply({ content:"🌽 Ngô cay siêu ngon 🔥", files:["https://i.imgur.com/9Xn6F6C.png"] }) }

if(msg==="thưởng thơ" || msg==="thuong tho"){ message.reply(🌽 Ngô vàng thơm giữa chiều nay Gió ru đồng bãi ngất ngây hương đồng Nướng lên thơm lửa hồng Chấm thêm muối ớt cay nồng mê say 🌽) }

// Button UI for fun const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js")

if(msg==="menufun"){ const row = new ActionRowBuilder().addComponents( new ButtonBuilder().setCustomId("ngocay_btn").setLabel("🌽 Ngô cay").setStyle(ButtonStyle.Success), new ButtonBuilder().setCustomId("tho_btn").setLabel("📜 Thưởng thơ").setStyle(ButtonStyle.Primary) ) message.reply({content:"🎉 FUN MENU",components:[row]}) }

client.on("interactionCreate", async interaction=>{ if(!interaction.isButton()) return

if(interaction.customId==="ngocay_btn"){ return interaction.reply({ content:"🌽 Ngô cay siêu ngon 🔥", files:["https://i.imgur.com/9Xn6F6C.png"], ephemeral:false }) }

if(interaction.customId==="tho_btn"){ return interaction.reply({ content:🌽 Ngô vàng thơm giữa chiều nay Gió ru đồng bãi ngất ngây hương đồng Nướng lên thơm lửa hồng Chấm thêm muối ớt cay nồng mê say 🌽, ephemeral:false }) } })

client.login(process.env.TOKEN)
