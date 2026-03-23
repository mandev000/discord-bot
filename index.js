// index.js - Bot Discord Fake Casino JS | discord.js v14 | Full rigged + animation + /help
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

const DAILY_AMOUNT = 50;
const COOLDOWN = 86400 * 1000; // ms
let RIGGED_MODE = false;
const RIGGED_WIN_RATE = 0.70;

const SHOP_ITEMS = {
  vip_bronze: { price: 2000, desc: 'VIP Bronze fake' },
  vip_silver: { price: 5000, desc: 'VIP Silver fake' },
  vip_gold: { price: 10000, desc: 'VIP Gold fake' }
};

const YOUR_DISCORD_ID = '123456789012345678'; // THAY BẰNG ID DISCORD CỦA MÀY

// Animation GIF đẹp
const ANIM_DICE_ROLL = 'https://media.giphy.com/media/3o6Zt6KHxJTzXCnSvu/giphy.gif';
const ANIM_BOWL_SHAKE = 'https://media.tenor.com/images/abcdef1234567890/tenor.gif'; // thay link xoc dia nếu tìm được
const ANIM_WIN = 'https://media.giphy.com/media/26tPplGWjN0xLybiU/giphy.gif';
const ANIM_LOSE = 'https://media.tenor.com/images/sad-lose-fail.gif'; // thay nếu muốn

client.once('ready', async () => {
  console.log(`Bot JS chạy: ${client.user.tag}`);

  const commands = [
    new SlashCommandBuilder().setName('help').setDescription('Xem danh sách lệnh bot'),
    new SlashCommandBuilder().setName('balance').setDescription('Check số xu fake'),
    new SlashCommandBuilder().setName('daily').setDescription('Nhận xu free mỗi ngày'),
    new SlashCommandBuilder().setName('top').setDescription('Top giàu nhất server fake'),
    new SlashCommandBuilder()
      .setName('taixiu')
      .setDescription('Chơi tài xỉu ')
      .addStringOption(opt => opt.setName('choose').setDescription('Tài hoặc Xỉu').setRequired(true).addChoices(
        { name: 'Tài', value: 'tài' },
        { name: 'Xỉu', value: 'xỉu' }
      ))
      .addIntegerOption(opt => opt.setName('bet').setDescription('Số xu cược').setRequired(true)),
    new SlashCommandBuilder()
      .setName('xocdia')
      .setDescription('Chơi xóc đĩa ')
      .addStringOption(opt => opt.setName('choose').setDescription('Chẵn hoặc Lẻ').setRequired(true).addChoices(
        { name: 'Chẵn', value: 'chẵn' },
        { name: 'Lẻ', value: 'lẻ' }
      ))
      .addIntegerOption(opt => opt.setName('bet').setDescription('Số xu cược').setRequired(true)),
    new SlashCommandBuilder().setName('shop').setDescription('Xem shop VIP '),
    new SlashCommandBuilder()
      .setName('buy')
      .setDescription('Mua VIP fake')
      .addStringOption(opt => opt.setName('item').setDescription('vip_bronze | vip_silver | vip_gold').setRequired(true)),
    new SlashCommandBuilder()
      .setName('redeem')
      .setDescription('Nhập code nhận xu fake')
      .addStringOption(opt => opt.setName('code').setDescription('Code').setRequired(true))
  ].map(cmd => cmd.toJSON());

  const rest = new REST({ version: '10' }).setToken(process.env.BOT_TOKEN);
  try {
    await rest.put(Routes.applicationCommands(client.user.id), { body: commands });
    console.log('Đã đăng ký slash commands');
  } catch (error) {
    console.error('Lỗi sync lệnh:', error);
  }
});

client.on('interactionCreate', async interaction => {
  if (!interaction.isChatInputCommand()) return;

  const userId = interaction.user.id;
  if (!data.users[userId]) {
    data.users[userId] = { money: 0, last_daily: 0 };
    saveData();
  }

  const userData = data.users[userId];

  if (interaction.commandName === 'help') {
    const helpEmbed = new EmbedBuilder()
      .setTitle('📜 DANH SÁCH LỆNH BOT CASINO ')
      .setColor('#00ffff')
      .setDescription('Tất cả lệnh dùng dấu / (slash)\n\n' +
        '**/balance** → Check số xu\n' +
        '**/daily** → Nhận 500 xu miễn phí mỗi ngày\n' +
        '**/top** → Xem top 10 giàu nhất\n' +
        '**/taixiu choose:<Tài/Xỉu> bet:<số xu>** → Chơi tài xỉu\n' +
        '**/xocdia choose:<Chẵn/Lẻ> bet:<số xu>** → Chơi xóc đĩa\n' +
        '**/shop** → Xem shop VIP\n' +
        '**/buy item:<tên>** → Mua VIP fake\n' +
        '**/redeem code:<code>** → Nhập code nhận xu\n\n' +
        'Lệnh admin (chỉ chủ bot):\n!rigged on/off\n!addcode <code> <số xu>')
      .setFooter({ text: 'Fake vui vẻ thôi cu!' });
    await interaction.reply({ embeds: [helpEmbed] });
  }

  // Các lệnh khác giữ nguyên như trước, chỉ thêm /help
  if (interaction.commandName === 'balance') {
    await interaction.reply(`**\( {interaction.user.username}** có ** \){userData.money}** xu fake!`);
  }

  // ... (copy phần daily, top, taixiu, xocdia, shop, buy, redeem từ code cũ, tao không paste lặp lại để ngắn gọn)

  // Nếu mày cần phần còn lại thì bảo, nhưng code cũ đã có, chỉ thêm help là đủ
});

client.on('messageCreate', async message => {
  if (!message.content.startsWith('!') || message.author.bot) return;
  const args = message.content.slice(1).trim().split(/ +/);
  const cmd = args.shift().toLowerCase();

  if (message.author.id !== YOUR_DISCORD_ID) return;

  if (cmd === 'addcode') {
    const code = args[0]?.toUpperCase();
    const amount = parseInt(args[1]);
    if (!code || isNaN(amount)) return message.reply('!addcode <code> <số xu>');
    if (!data.codes) data.codes = {};
    data.codes[code] = amount;
    saveData();
    message.reply(`Add code **\( {code}** + \){amount} xu OK!`);
  }

  if (cmd === 'rigged') {
    const mode = args[0]?.toLowerCase();
    RIGGED_MODE = mode === 'on';
    message.reply(`Rigged ${RIGGED_MODE ? 'ON (70% nhà cái thắng)' : 'OFF (fair)'}`);
  }
});

client.login(process.env.BOT_TOKEN);;
  }

  if (cmd === 'rigged' && message.author.id === YOUR_DISCORD_ID) {
    const mode = args[0]?.toLowerCase();
    RIGGED_MODE = mode === 'on';
    message.reply(`Rigged ${RIGGED_MODE ? 'ON - bịp 70%' : 'OFF - fair'}`);
  }
});

client.login(process.env.BOT_TOKEN);)

bot.run(os.getenv("BOT_TOKEN"))  # Railway đọc từ biến BOT_TOKEN
