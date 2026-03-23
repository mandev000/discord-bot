// index.js - Bot Discord Fake Casino JS | discord.js v14 | Full rigged + animation
const { Client, GatewayIntentBits, EmbedBuilder, SlashCommandBuilder, REST, Routes } = require('discord.js');
const fs = require('fs');
const path = require('path');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

const DATA_FILE = path.join(__dirname, 'casino_data.json');
let data = loadData();

function loadData() {
  if (fs.existsSync(DATA_FILE)) {
    return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
  }
  return { users: {}, codes: {} };
}

function saveData() {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

const DAILY_AMOUNT = 500;
const COOLDOWN = 86400 * 1000; // ms
let RIGGED_MODE = false;
const RIGGED_WIN_RATE = 0.70;

const SHOP_ITEMS = {
  vip_bronze: { price: 2000, desc: 'VIP Bronze fake' },
  vip_silver: { price: 5000, desc: 'VIP Silver fake' },
  vip_gold: { price: 10000, desc: 'VIP Gold fake' }
};

const YOUR_DISCORD_ID = '123456789012345678'; // THAY BẰNG ID CỦA MÀY

// Animation GIF
const ANIM_DICE_ROLL = 'https://media.giphy.com/media/3o6Zt6KHxJTzXCnSvu/giphy.gif';
const ANIM_BOWL_SHAKE = 'https://media.tenor.com/images/abcdef1234567890/tenor.gif'; // thay link xoc dia shake nếu tìm được
const ANIM_WIN = 'https://media.giphy.com/media/26tPplGWjN0xLybiU/giphy.gif';
const ANIM_LOSE = 'https://media.tenor.com/images/sad-lose-fail.gif'; // thay nếu muốn

client.once('ready', async () => {
  console.log(`Bot JS chạy: ${client.user.tag}`);

  const commands = [
    new SlashCommandBuilder().setName('balance').setDescription('Check xu fake'),
    new SlashCommandBuilder().setName('daily').setDescription('Nhận xu free'),
    new SlashCommandBuilder().setName('top').setDescription('Top giàu fake'),
    new SlashCommandBuilder()
      .setName('taixiu')
      .setDescription('Tài Xỉu fake')
      .addStringOption(opt => opt.setName('choose').setDescription('Tài hoặc Xỉu').setRequired(true))
      .addIntegerOption(opt => opt.setName('bet').setDescription('Số xu cược').setRequired(true)),
    new SlashCommandBuilder()
      .setName('xocdia')
      .setDescription('Xóc Đĩa fake')
      .addStringOption(opt => opt.setName('choose').setDescription('Chẵn hoặc Lẻ').setRequired(true))
      .addIntegerOption(opt => opt.setName('bet').setDescription('Số xu cược').setRequired(true)),
    new SlashCommandBuilder().setName('shop').setDescription('Shop VIP fake'),
    new SlashCommandBuilder()
      .setName('buy')
      .setDescription('Mua VIP fake')
      .addStringOption(opt => opt.setName('item').setDescription('vip_bronze | vip_silver | vip_gold').setRequired(true)),
    new SlashCommandBuilder()
      .setName('redeem')
      .setDescription('Nhập code xu')
      .addStringOption(opt => opt.setName('code').setDescription('Code').setRequired(true))
  ].map(cmd => cmd.toJSON());

  const rest = new REST({ version: '10' }).setToken(process.env.BOT_TOKEN);
  try {
    await rest.put(Routes.applicationCommands(client.user.id), { body: commands });
    console.log('Slash commands đăng ký OK');
  } catch (error) {
    console.error(error);
  }
});

client.on('interactionCreate', async interaction => {
  if (!interaction.isChatInputCommand()) return;

  const userId = interaction.user.id;
  if (!data.users[userId]) {
    data.users[userId] = { money: 1000, last_daily: 0 };
    saveData();
  }

  const userData = data.users[userId];

  if (interaction.commandName === 'balance') {
    await interaction.reply(`**\( {interaction.user.username}** có ** \){userData.money}** xu fake!`);
  }

  if (interaction.commandName === 'daily') {
    const now = Date.now();
    if (now - userData.last_daily < COOLDOWN) {
      const remaining = Math.ceil((COOLDOWN - (now - userData.last_daily)) / 1000 / 60);
      await interaction.reply(`Chờ thêm **${remaining} phút** mới daily!`);
      return;
    }
    userData.money += DAILY_AMOUNT;
    userData.last_daily = now;
    saveData();
    await interaction.reply(`Daily +**\( {DAILY_AMOUNT}** xu! Tổng: ** \){userData.money}**`);
  }

  if (interaction.commandName === 'top') {
    const sorted = Object.entries(data.users)
      .sort((a, b) => b[1].money - a[1].money)
      .slice(0, 10);
    let msg = '**Top 10 giàu fake**\n';
    for (let i = 0; i < sorted.length; i++) {
      const [id, info] = sorted[i];
      msg += `\( {i+1}. <@ \){id}> - **${info.money}** xu\n`;
    }
    await interaction.reply(msg || 'Chưa ai giàu');
  }

  if (interaction.commandName === 'taixiu') {
    const choose = interaction.options.getString('choose').toLowerCase();
    const bet = interaction.options.getInteger('bet');

    if (bet <= 0 || userData.money < bet) {
      return interaction.reply('Bet ngu hoặc hết tiền!');
    }

    const embedRoll = new EmbedBuilder()
      .setTitle('🎲 ĐANG LẮC TÀI XỈU...')
      .setColor('#00ffff')
      .setImage(ANIM_DICE_ROLL);

    await interaction.reply({ embeds: [embedRoll] });

    await new Promise(r => setTimeout(r, 4000));

    const dice = [Math.floor(Math.random()*6)+1, Math.floor(Math.random()*6)+1, Math.floor(Math.random()*6)+1];
    const total = dice.reduce((a,b)=>a+b,0);
    const result = total >= 11 ? 'Tài' : 'Xỉu';

    let win = (choose === 'tài' || choose === 'tai') && result === 'Tài' ||
              (choose === 'xỉu' || choose === 'xiu') && result === 'Xỉu';

    if (RIGGED_MODE) {
      win = Math.random() >= RIGGED_WIN_RATE ? win : false;
    }

    let embedResult;
    if (win) {
      userData.money += bet;
      embedResult = new EmbedBuilder()
        .setTitle('THẮNG LỚN!')
        .setDescription(`Cược **\( {bet}** → ** \){choose.toUpperCase()}**\nKết quả: \( {dice.join(', ')} = ** \){total}** → **\( {result}**\n+** \){bet}** xu\nTổng: **${userData.money}**`)
        .setColor('#00ff00')
        .setImage(ANIM_WIN);
    } else {
      userData.money -= bet;
      embedResult = new EmbedBuilder()
        .setTitle('THUA MẸ!')
        .setDescription(`Cược **\( {bet}** → ** \){choose.toUpperCase()}**\nKết quả: \( {dice.join(', ')} = ** \){total}** → **\( {result}**\nCòn ** \){userData.money}** xu`)
        .setColor('#ff0000')
        .setImage(ANIM_LOSE);
    }

    saveData();
    await interaction.followup({ embeds: [embedResult] });
  }

  // Tương tự cho xocdia (copy logic, thay animation và result chẵn/lẻ)
  if (interaction.commandName === 'xocdia') {
    const choose = interaction.options.getString('choose').toLowerCase();
    const bet = interaction.options.getInteger('bet');

    if (bet <= 0 || userData.money < bet) {
      return interaction.reply('Bet ngu hoặc hết tiền!');
    }

    const embedShake = new EmbedBuilder()
      .setTitle('🍲 ĐANG XÓC ĐĨA...')
      .setColor('#ffd700')
      .setImage(ANIM_BOWL_SHAKE);

    await interaction.reply({ embeds: [embedShake] });

    await new Promise(r => setTimeout(r, 4000));

    const dice = Array(4).fill(0).map(() => Math.floor(Math.random()*6)+1);
    const total = dice.reduce((a,b)=>a+b,0);
    const result = total % 2 === 0 ? 'Chẵn' : 'Lẻ';

    let win = (choose === 'chẵn' || choose === 'chan') && result === 'Chẵn' ||
              (choose === 'lẻ' || choose === 'le') && result === 'Lẻ';

    if (RIGGED_MODE) {
      win = Math.random() >= RIGGED_WIN_RATE ? win : false;
    }

    let embedResult;
    if (win) {
      userData.money += bet;
      embedResult = new EmbedBuilder()
        .setTitle('THẮNG ĐỈNH!')
        .setDescription(`Cược **\( {bet}** → ** \){choose.toUpperCase()}**\nKết quả: \( {dice.join(', ')} = ** \){total}** → **\( {result}**\n+** \){bet}** xu\nTổng: **${userData.money}**`)
        .setColor('#00ff00')
        .setImage(ANIM_WIN);
    } else {
      userData.money -= bet;
      embedResult = new EmbedBuilder()
        .setTitle('THUA ĐẮNG!')
        .setDescription(`Cược **\( {bet}** → ** \){choose.toUpperCase()}**\nKết quả: \( {dice.join(', ')} = ** \){total}** → **\( {result}**\nCòn ** \){userData.money}** xu`)
        .setColor('#ff0000')
        .setImage(ANIM_LOSE);
    }

    saveData();
    await interaction.followup({ embeds: [embedResult] });
  }

  // Shop, buy, redeem giữ tương tự Python, dùng reply
  if (interaction.commandName === 'shop') {
    let msg = '**SHOP FAKE**\n';
    for (const [item, info] of Object.entries(SHOP_ITEMS)) {
      msg += `- **${item.toUpperCase()}**: ${info.price} xu - ${info.desc}\n`;
    }
    await interaction.reply(msg + '\nDùng /buy <item>');
  }

  if (interaction.commandName === 'buy') {
    const item = interaction.options.getString('item').toLowerCase();
    if (!SHOP_ITEMS[item]) return interaction.reply('Item ko tồn tại!');
    const price = SHOP_ITEMS[item].price;
    if (userData.money < price) return interaction.reply(`Cần ${price} xu, mày có ${userData.money}`);
    userData.money -= price;
    saveData();
    await interaction.reply(`Mua **${item.toUpperCase()}** OK! VIP fake rồi cu!`);
  }

  if (interaction.commandName === 'redeem') {
    const code = interaction.options.getString('code').toUpperCase();
    if (!data.codes[code]) return interaction.reply('Code sai hoặc hết hạn!');
    const amount = data.codes[code];
    userData.money += amount;
    delete data.codes[code];
    saveData();
    await interaction.reply(`Code OK! +**\( {amount}** xu. Tổng ** \){userData.money}**`);
  }
});

client.on('messageCreate', async message => {
  if (!message.content.startsWith('!') || message.author.bot) return;
  const args = message.content.slice(1).trim().split(/ +/);
  const cmd = args.shift().toLowerCase();

  if (cmd === 'addcode' && message.author.id === YOUR_DISCORD_ID) {
    const code = args[0]?.toUpperCase();
    const amount = parseInt(args[1]);
    if (!code || isNaN(amount)) return message.reply('Dùng !addcode <code> <số xu>');
    if (!data.codes) data.codes = {};
    data.codes[code] = amount;
    saveData();
    message.reply(`Add code **\( {code}** + \){amount} xu OK!`);
  }

  if (cmd === 'rigged' && message.author.id === YOUR_DISCORD_ID) {
    const mode = args[0]?.toLowerCase();
    RIGGED_MODE = mode === 'on';
    message.reply(`Rigged ${RIGGED_MODE ? 'ON - bịp 70%' : 'OFF - fair'}`);
  }
});

client.login(process.env.BOT_TOKEN);)

bot.run(os.getenv("BOT_TOKEN"))  # Railway đọc từ biến BOT_TOKEN
