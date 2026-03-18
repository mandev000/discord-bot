// 🚀 GOD MODE CASINO BOT 🚀

const {
 Client,
 GatewayIntentBits,
 ActionRowBuilder,
 ButtonBuilder,
 ButtonStyle
} = require("discord.js")

const fs = require("fs")

const client = new Client({
 intents: [
  GatewayIntentBits.Guilds,
  GatewayIntentBits.GuildMessages,
  GatewayIntentBits.MessageContent
 ]
})

// ================= LOAD =================

function load(file) {
 return fs.existsSync(file)
  ? JSON.parse(fs.readFileSync(file))
  : {}
}

let money = load("money.json")
let bank = load("bank.json")
let inventory = load("inventory.json")
let xp = load("xp.json")
let market = load("market.json")

function save() {
 fs.writeFileSync("money.json", JSON.stringify(money, null, 2))
 fs.writeFileSync("bank.json", JSON.stringify(bank, null, 2))
 fs.writeFileSync("inventory.json", JSON.stringify(inventory, null, 2))
 fs.writeFileSync("xp.json", JSON.stringify(xp, null, 2))
 fs.writeFileSync("market.json", JSON.stringify(market, null, 2))
}

// ================= CONFIG =================

const shop = { crate: 150, supercrate: 500, vip: 2000 }
const cooldown = new Set()

client.once("ready", () => console.log("🔥 GOD MODE ONLINE"))

// ================= MESSAGE =================

client.on("messageCreate", async (message) => {
 if (message.author.bot) return

 const msg = message.content.toLowerCase()
 const args = msg.split(" ")
 const user = message.author.id

 // cooldown
 if (cooldown.has(user)) return
 cooldown.add(user)
 setTimeout(() => cooldown.delete(user), 1000)

 // init
 if (!money[user]) money[user] = 500
 if (!bank[user]) bank[user] = 0
 if (!inventory[user]) inventory[user] = []
 if (!xp[user]) xp[user] = { xp: 0, level: 1 }

 // ================= XP =================

 function addXP(amount) {
  xp[user].xp += amount
  if (xp[user].xp >= xp[user].level * 100) {
   xp[user].xp = 0
   xp[user].level++
   message.reply(`🎉 LEVEL UP ${xp[user].level}`)
  }
 }

 // ================= BASIC =================

 if (msg === "help") {
  return message.reply(`
💎 GOD MODE

money | bank | level
slot | taixiu | xocdia
shop | buy | inventory
opencrate | opensuper
deposit | withdraw
market | sell | buyitem
top | menu | menufun
`)
 }

 if (msg === "money") return message.reply(`💰 ${money[user]}`)
 if (msg === "bank") return message.reply(`🏦 ${bank[user]}`)
 if (msg === "level")
  return message.reply(`⭐ Lv.${xp[user].level} (${xp[user].xp})`)

 // ================= BANK =================

 if (msg.startsWith("deposit")) {
  let a = parseInt(args[1])
  if (isNaN(a) || a <= 0 || money[user] < a) return
  money[user] -= a
  bank[user] += a
  save()
  return message.reply(`🏦 +${a}`)
 }

 if (msg.startsWith("withdraw")) {
  let a = parseInt(args[1])
  if (isNaN(a) || a <= 0 || bank[user] < a) return
  bank[user] -= a
  money[user] += a
  save()
  return message.reply(`💰 +${a}`)
 }

 // ================= SHOP =================

 if (msg === "shop") {
  return message.reply(`🛒 SHOP
crate: 150
supercrate: 500
vip: 2000`)
 }

 if (msg.startsWith("buy")) {
  let item = args[1]
  if (!shop[item] || money[user] < shop[item]) return
  money[user] -= shop[item]
  inventory[user].push(item)
  addXP(5)
  save()
  return message.reply(`🛒 Mua ${item}`)
 }

 // ================= INVENTORY =================

 if (msg === "inventory") {
  return message.reply(
   inventory[user].length
    ? inventory[user].join(", ")
    : "🎒 Trống"
  )
 }

 // ================= CRATE =================

 if (msg === "opencrate") {
  if (!inventory[user].includes("crate")) return
  inventory[user].splice(inventory[user].indexOf("crate"), 1)
  let r = Math.floor(Math.random() * 300) + 100
  money[user] += r
  addXP(10)
  save()
  return message.reply(`🎁 +${r}`)
 }

 if (msg === "opensuper") {
  if (!inventory[user].includes("supercrate")) return
  inventory[user].splice(inventory[user].indexOf("supercrate"), 1)
  let r = Math.floor(Math.random() * 1000) + 500
  money[user] += r
  addXP(20)
  save()
  return message.reply(`💎 +${r}`)
 }

 // ================= SLOT =================

 if (msg === "slot") {
  const icons = ["🍒", "🍋", "💎", "7️⃣"]
  let m = await message.reply("🎰 spinning...")

  let spin = setInterval(() => {
   m.edit(
    `🎰 ${icons.sort(() => Math.random() - 0.5).slice(0, 3).join(" | ")}`
   )
  }, 120)

  setTimeout(() => {
   clearInterval(spin)
   let [a, b, c] = icons.sort(() => Math.random() - 0.5)
   let win = a === b && b === c

   if (win) {
    money[user] += 500
    addXP(15)
   } else {
    money[user] -= 50
   }

   save()
   m.edit(`${a} | ${b} | ${c} ${win ? "🎉" : "💀"}`)
  }, 2000)
 }

 // ================= FUN =================

 if (msg === "ngocay") {
  return message.reply({
   content: "🌽 Ngô cay siêu ngon 🔥",
   files: ["https://i.imgur.com/9Xn6F6C.png"]
  })
 }

 if (msg === "thưởng thơ" || msg === "thuong tho") {
  return message.reply(`
🌽 Ngô vàng thơm giữa chiều nay  
Gió ru đồng bãi ngất ngây hương đồng  
Nướng lên thơm lửa hồng  
Chấm thêm muối ớt cay nồng mê say 🌽`)
 }

 // ================= MENU BUTTON =================

 if (msg === "menu") {
  const row = new ActionRowBuilder().addComponents(
   new ButtonBuilder()
    .setCustomId("slot")
    .setLabel("🎰 Slot")
    .setStyle(ButtonStyle.Primary),
   new ButtonBuilder()
    .setCustomId("xocdia")
    .setLabel("🥣 Xóc Đĩa")
    .setStyle(ButtonStyle.Success)
  )

  return message.reply({
   content: "🎮 MENU GAME",
   components: [row]
  })
 }

 if (msg === "menufun") {
  const row = new ActionRowBuilder().addComponents(
   new ButtonBuilder()
    .setCustomId("ngocay")
    .setLabel("🌽 Ngô cay")
    .setStyle(ButtonStyle.Success),
   new ButtonBuilder()
    .setCustomId("tho")
    .setLabel("📜 Thơ")
    .setStyle(ButtonStyle.Primary)
  )

  return message.reply({
   content: "🎉 FUN MENU",
   components: [row]
  })
 }
})

// ================= BUTTON =================

client.on("interactionCreate", async (i) => {
 if (!i.isButton()) return

 const user = i.user.id
 if (!money[user]) money[user] = 500

 if (i.customId === "ngocay") {
  return i.reply({
   content: "🌽 Ngô cay siêu ngon 🔥",
   files: ["https://i.imgur.com/9Xn6F6C.png"]
  })
 }

 if (i.customId === "tho") {
  return i.reply({
   content: "🌽 Ngô vàng thơm giữa chiều nay..."
  })
 }

 if (i.customId === "xocdia") {
  let win = Math.random() < 0.5
  return i.reply(win ? "🥣 🎉 WIN" : "🥣 💀 LOSE")
 }
})

client.login(process.env.TOKEN)
