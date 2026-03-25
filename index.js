const {
  Client, GatewayIntentBits, EmbedBuilder,
  ActionRowBuilder, ButtonBuilder, ButtonStyle,
  ModalBuilder, TextInputBuilder, TextInputStyle
} = require('discord.js');
const fs = require('fs');

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent]
});

const FILE = './data.json';
let data = fs.existsSync(FILE) ? JSON.parse(fs.readFileSync(FILE)) : { users: {}, codes: {} };

function save() {
  fs.writeFileSync(FILE, JSON.stringify(data, null, 2));
}

function getUser(id) {
  if (!data.users[id]) data.users[id] = { money: 1000, lastDaily: 0 };
  return data.users[id];
}

// CONFIG
const DAILY = 100;
const DAILY_CD = 86400000;
const GAME_TIME = 30000;
const JACKPOT_RATE = 0.05;

let currentGames = {};
let history = [];

// READY
client.once('ready', () => {
  console.log(`🔥 Casino Ready: ${client.user.tag}`);
});

// COMMAND
client.on('messageCreate', async msg => {
  if (msg.author.bot) return;

  const args = msg.content.split(/\s+/);
  const cmd = args[0].toLowerCase();
  const user = getUser(msg.author.id);

  if (cmd === 'balance')
    return msg.reply(`💰 ${msg.author.username}: **${user.money} Mcoint**`);

  if (cmd === 'daily') {
    if (Date.now() - user.lastDaily < DAILY_CD)
      return msg.reply('⏳ Chưa tới giờ!');
    user.money += DAILY;
    user.lastDaily = Date.now();
    save();
    return msg.reply(`🎁 +${DAILY} Mcoint`);
  }

  if (cmd === 'taixiu') {
    if (currentGames[msg.channelId]) return msg.reply('⚠️ Đang có ván!');

    const embed = new EmbedBuilder()
      .setTitle('🎲 TÀI XỈU CASINO')
      .setDescription('Chọn cửa và nhập tiền cược\n⏳ 30 giây')
      .setColor(0x00ffcc)
      .addFields(
        { name: '💰 HŨ', value: '0', inline: true },
        { name: '📊 Cược', value: 'Tài: 0\nXỉu: 0', inline: false }
      );

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId('bet_tai').setLabel('TÀI').setStyle(ButtonStyle.Success),
      new ButtonBuilder().setCustomId('bet_xiu').setLabel('XỈU').setStyle(ButtonStyle.Danger)
    );

    const sent = await msg.channel.send({ embeds: [embed], components: [row] });

    currentGames[msg.channelId] = {
      bets: { tai: [], xiu: [] },
      messageId: sent.id,
      hũ: 0,
      time: Date.now() + GAME_TIME
    };

    countdown(msg.channelId, 30);
    setTimeout(() => endGame(msg.channelId), GAME_TIME);
  }
});

// COUNTDOWN
async function countdown(channelId, time) {
  let t = time;
  const int = setInterval(async () => {
    t--;
    const game = currentGames[channelId];
    if (!game) return clearInterval(int);

    const channel = client.channels.cache.get(channelId);
    const msg = await channel.messages.fetch(game.messageId).catch(() => null);
    if (!msg) return clearInterval(int);

    const embed = EmbedBuilder.from(msg.embeds[0]);
    embed.setDescription(`Chọn cửa và nhập tiền cược\n⏳ ${t}s`);

    msg.edit({ embeds: [embed] }).catch(() => {});
    if (t <= 0) clearInterval(int);
  }, 1000);
}

// BUTTON
client.on('interactionCreate', async i => {
  if (!i.isButton()) return;
  const game = currentGames[i.channelId];
  if (!game) return i.reply({ content: 'Hết game!', ephemeral: true });

  const type = i.customId.split('_')[1];

  const modal = new ModalBuilder()
    .setCustomId(`modal_${type}`)
    .setTitle('Nhập tiền');

  const input = new TextInputBuilder()
    .setCustomId('amount')
    .setLabel('Số tiền')
    .setStyle(TextInputStyle.Short);

  modal.addComponents(new ActionRowBuilder().addComponents(input));
  await i.showModal(modal);
});

// MODAL
client.on('interactionCreate', async i => {
  if (!i.isModalSubmit()) return;

  const game = currentGames[i.channelId];
  if (!game) return;

  const user = getUser(i.user.id);
  const amount = parseInt(i.fields.getTextInputValue('amount'));
  const type = i.customId.split('_')[1];

  if (!amount || amount <= 0 || amount > user.money)
    return i.reply({ content: '❌ Tiền lỗi', ephemeral: true });

  game.bets[type].push({ id: i.user.id, name: i.user.username, amount });
  user.money -= amount;
  game.hũ += Math.floor(amount * JACKPOT_RATE);

  save();
  updateUI(i.channelId);

  i.reply({ content: `✅ cược ${amount} vào ${type.toUpperCase()}`, ephemeral: true });
});

// UPDATE UI
async function updateUI(channelId) {
  const game = currentGames[channelId];
  const channel = client.channels.cache.get(channelId);
  const msg = await channel.messages.fetch(game.messageId);

  const tai = game.bets.tai.reduce((a, b) => a + b.amount, 0);
  const xiu = game.bets.xiu.reduce((a, b) => a + b.amount, 0);

  const embed = EmbedBuilder.from(msg.embeds[0]);
  embed.setFields(
    { name: '💰 HŨ', value: `${game.hũ}`, inline: true },
    { name: '📊 Cược', value: `Tài: ${tai}\nXỉu: ${xiu}` }
  );

  msg.edit({ embeds: [embed] });
}

// END GAME
async function endGame(channelId) {
  const game = currentGames[channelId];
  if (!game) return;
  delete currentGames[channelId];

  const channel = client.channels.cache.get(channelId);

  // animation
  const anim = await channel.send('🎲 🎲 🎲 Đang lắc...');
  await new Promise(r => setTimeout(r, 2000));
  anim.delete();

  const d1 = rand();
  const d2 = rand();
  const d3 = rand();
  const sum = d1 + d2 + d3;

  const result = sum >= 11 ? 'tai' : 'xiu';

  const winners = game.bets[result];
  let total = 0;

  for (const w of winners) {
    const u = getUser(w.id);
    const win = w.amount * 2;
    u.money += win;
    total += win;
  }

  save();

  const embed = new EmbedBuilder()
    .setTitle('🎲 KẾT QUẢ')
    .setDescription(`🎲 ${d1} + ${d2} + ${d3} = **${sum}**\n👉 ${result.toUpperCase()}`)
    .addFields({
      name: '🏆 Thắng',
      value: winners.length
        ? winners.map(x => `${x.name} + ${x.amount * 2}`).join('\n')
        : 'Không ai'
    })
    .setColor(0xffcc00);

  channel.send({ embeds: [embed] });
}

// RANDOM
function rand() {
  return Math.floor(Math.random() * 6) + 1;
}

client.login(process.env.BOT_TOKEN);
