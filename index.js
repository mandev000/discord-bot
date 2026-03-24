const {
  Client, GatewayIntentBits, EmbedBuilder, ActionRowBuilder,
  ButtonBuilder, ButtonStyle, ModalBuilder, TextInputBuilder,
  TextInputStyle
} = require('discord.js');
const fs = require('fs');

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent]
});

const FILE = './data.json';
let data = fs.existsSync(FILE) ? JSON.parse(fs.readFileSync(FILE)) : { users: {}, codes: {} };

function save() { fs.writeFileSync(FILE, JSON.stringify(data, null, 2)); }

function getUser(id) {
  if (!data.users[id]) data.users[id] = { money: 1000, lastDaily: 0 };
  return data.users[id];
}

const DAILY = 50;
const DAILY_CD = 86400000;
const RIGGED_RATE = 0.60;
const GAME_TIME = 40000;

let currentGames = {};
let gameHistory = [];

// ================== READY ==================
client.once('ready', () => {
  console.log(`Casino Pro Max FULL + COUNTDOWN + SOI CẦU Ready: ${client.user.tag}`);
});

// ================== COMMANDS ==================
client.on('messageCreate', async msg => {
  if (msg.author.bot) return;

  const args = msg.content.trim().split(/\s+/);
  const cmd = args[0].toLowerCase();
  const user = getUser(msg.author.id);

  if (cmd === 'help') return msg.reply(`💰 **CASINO PRO **\n\nbalance\ndaily\ntop\ntaixiu\nxocdia\nsoicau\nredeem <code>`);
  if (cmd === 'balance') return msg.reply(`💰 \( {msg.author.username}: ** \){user.money}** Mcoint`);
  if (cmd === 'daily') {
    if (Date.now() - user.lastDaily < DAILY_CD) return msg.reply('⏳ Chưa tới giờ!');
    user.money += DAILY; user.lastDaily = Date.now(); save();
    return msg.reply(`🎁 +${DAILY} Mcoint`);
  }
  if (cmd === 'top') {
    const top = Object.entries(data.users).sort((a,b)=>b[1].money-a[1].money).slice(0,10);
    let txt = '🏆 **TOP GIÀU NHẤT**\n';
    top.forEach((u,i)=> txt += `${i+1}. ${u[1].money} Mcoint\n`);
    return msg.reply(txt);
  }
  if (cmd === 'redeem') {
    const code = args[1]?.toUpperCase();
    if (!code || !data.codes[code]) return msg.reply('❌ Code sai hoặc đã dùng');
    const amt = data.codes[code]; delete data.codes[code];
    user.money += amt; save();
    return msg.reply(`🎁 +${amt} Mcoint`);
  }
  if (cmd === 'soicau') {
    if (!gameHistory.length) return msg.reply('📊 Chưa có ván nào để soi!');
    let text = '📊 **SOI CẦU TÀI XỈU - XÓC ĐĨA** (20 ván gần nhất)\n\n';
    gameHistory.forEach(h => text += `${h.time} | ${h.type.toUpperCase()} → ${h.details}\n`);
    const taixiu = gameHistory.filter(h => h.type === 'taixiu');
    if (taixiu.length) {
      const taiWin = taixiu.filter(h => h.result === 'tai').length;
      text += `\nTài thắng: \( {taiWin}/ \){taixiu.length} (${Math.round(taiWin/taixiu.length*100)}%)`;
    }
    return msg.reply(text);
  }

  if (cmd === 'taixiu' || cmd === 'xocdia') {
    if (currentGames[msg.channelId]) return msg.reply('⚠️ Đang có ván khác!');
    const isTaixiu = cmd === 'taixiu';

    const embed = new EmbedBuilder()
      .setTitle(isTaixiu ? '🎲 TÀI XỈU' : '🥣 XÓC ĐĨA')
      .setDescription('Hãy chọn cửa và ghi số tiền cược\nKết thúc trong: **40 giây tới**')
      .setColor(isTaixiu ? 0x00ff00 : 0xaa00ff)
      .addFields(
        { name: 'HŨ', value: '0 Mcoint', inline: true },
        { name: 'TỔNG CƯỢC', value: 'Tài: 0\nXỉu: 0\nChẵn: 0\nLẻ: 0\nSố/Tổng: 0', inline: false }
      )
      .setFooter({ text: 'Powered by mxtbot.com' });

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId(`bet_${isTaixiu ? 'tai' : 'chan'}`).setLabel(isTaixiu ? 'TÀI' : 'CHẴN').setStyle(ButtonStyle.Success),
      new ButtonBuilder().setCustomId(`bet_${isTaixiu ? 'xiu' : 'le'}`).setLabel(isTaixiu ? 'XỈU' : 'LẺ').setStyle(ButtonStyle.Danger)
    );

    const sent = await msg.channel.send({ embeds: [embed], components: [row] });

    currentGames[msg.channelId] = {
      type: isTaixiu ? 'taixiu' : 'xocdia',
      bets: isTaixiu ? { tai: [], xiu: [] } : { chan: [], le: [] },
      endTime: Date.now() + GAME_TIME,
      messageId: sent.id,
      hũ: 0
    };

    startCountdown(msg.channelId, 40);
    setTimeout(() => endGame(msg.channelId), GAME_TIME);
  }
});

// COUNTDOWN
async function startCountdown(channelId, seconds) {
  let remaining = seconds;
  const interval = setInterval(async () => {
    remaining--;
    const game = currentGames[channelId];
    if (!game) return clearInterval(interval);
    const channel = client.channels.cache.get(channelId);
    if (!channel) return clearInterval(interval);
    const msg = await channel.messages.fetch(game.messageId).catch(() => null);
    if (!msg) return clearInterval(interval);

    const embed = EmbedBuilder.from(msg.embeds[0]);
    embed.setDescription(`Hãy chọn cửa và ghi số tiền cược\nKết thúc trong: **${remaining} giây tới**`);
    await msg.edit({ embeds: [embed] }).catch(() => {});
    if (remaining <= 0) clearInterval(interval);
  }, 1000);
}

// BUTTON → MODAL
client.on('interactionCreate', async interaction => {
  if (!interaction.isButton()) return;
  const game = currentGames[interaction.channelId];
  if (!game) return interaction.reply({ content: 'Ván cược đã kết thúc!', ephemeral: true });

  const type = interaction.customId.split('_')[1];
  const modal = new ModalBuilder().setCustomId(`modal_${type}`).setTitle('💰 Nhập số tiền cược');

  const input = new TextInputBuilder()
    .setCustomId('amount')
    .setLabel('Số Mcoint')
    .setStyle(TextInputStyle.Short)
    .setPlaceholder('Ví dụ: 50000')
    .setRequired(true);

  modal.addComponents(new ActionRowBuilder().addComponents(input));
  await interaction.showModal(modal);
});

// MODAL SUBMIT
client.on('interactionCreate', async interaction => {
  if (!interaction.isModalSubmit()) return;
  const game = currentGames[interaction.channelId];
  if (!game) return interaction.reply({ content: 'Ván đã kết thúc!', ephemeral: true });

  const user = getUser(interaction.user.id);
  const amount = parseInt(interaction.fields.getTextInputValue('amount'));
  if (!amount || amount <= 0 || amount > user.money) {
    return interaction.reply({ content: '❌ Số tiền không hợp lệ hoặc không đủ!', ephemeral: true });
  }

  const type = interaction.customId.split('_')[1];
  if ((game.type === 'taixiu' && (type === 'tai' || type === 'xiu')) ||
      (game.type === 'xocdia' && (type === 'chan' || type === 'le'))) {
    game.bets[type].push({ user: interaction.user.id, amount, name: interaction.user.username });
  }

  user.money -= amount;
  save();

  await updateGameEmbed(interaction.channelId);
  interaction.reply({ content: `✅ Đã cược **\( {amount}** Mcoint vào ** \){type.toUpperCase()}**`, ephemeral: true });
});

// UPDATE EMBED
async function updateGameEmbed(channelId) {
  const game = currentGames[channelId];
  if (!game) return;
  const channel = client.channels.cache.get(channelId);
  if (!channel) return;
  const msg = await channel.messages.fetch(game.messageId).catch(() => null);
  if (!msg) return;

  let totalTai = game.bets.tai ? game.bets.tai.reduce((a,b)=>a+b.amount,0) : 0;
  let totalXiu = game.bets.xiu ? game.bets.xiu.reduce((a,b)=>a+b.amount,0) : 0;
  let totalChan = game.bets.chan ? game.bets.chan.reduce((a,b)=>a+b.amount,0) : 0;
  let totalLe  = game.bets.le  ? game.bets.le.reduce((a,b)=>a+b.amount,0) : 0;

  const embed = EmbedBuilder.from(msg.embeds[0]);
  embed.setFields([
    { name: 'HŨ', value: `${game.hũ} Mcoint`, inline: true },
    { name: 'TỔNG CƯỢC', value: `Tài: ${totalTai}\nXỉu: ${totalXiu}\nChẵn: ${totalChan}\nLẻ: ${totalLe}\nSố/Tổng: 0`, inline: false }
  ]);
  await msg.edit({ embeds: [embed] });
}

// END GAME + ANIMATION (xóa sau khi lắc)
async function endGame(channelId) {
  const game = currentGames[channelId];
  if (!game) return;
  delete currentGames[channelId];

  const channel = client.channels.cache.get(channelId);
  if (!channel) return;
  const msg = await channel.messages.fetch(game.messageId).catch(() => null);
  if (!msg) return;

  // ANIMATION
  const rollingEmbed = new EmbedBuilder()
    .setTitle(game.type === 'taixiu' ? '🎲 ĐANG LẮC XÚC XẮC...' : '🥣 ĐANG XÓC ĐĨA...')
    .setDescription('🔄 🎲 🔄 🎲 🔄\nĐang lắc lắc nè...')
    .setColor('Yellow');
  const rollingMsg = await channel.send({ embeds: [rollingEmbed] });

  await new Promise(r => setTimeout(r, 2500));

  await rollingMsg.delete().catch(() => {}); // XÓA LUÔN

  let winSide, diceStr, resultText;

  if (game.type === 'taixiu') {
    const d1 = Math.floor(Math.random()*6)+1;
    const d2 = Math.floor(Math.random()*6)+1;
    const d3 = Math.floor(Math.random()*6)+1;
    const sum = d1 + d2 + d3;
    winSide = sum >= 11 ? 'tai' : 'xiu';
    if (Math.random() < RIGGED_RATE) winSide = winSide === 'tai' ? 'xiu' : 'tai';
    diceStr = `${d1} + ${d2} + ${d3} = ${sum}`;
    resultText = `Kết quả: **${diceStr}**\nChung cuộc: ${winSide.toUpperCase()}`;
  } else {
    winSide = Math.random() < 0.5 ? 'chan' : 'le';
    if (Math.random() < RIGGED_RATE) winSide = winSide === 'chan' ? 'le' : 'chan';
    resultText = `Kết quả: **${winSide.toUpperCase()}**`;
  }

  const winners = game.bets[winSide] || [];
  let totalWin = 0;
  for (const bet of winners) {
    const u = getUser(bet.user);
    const prize = bet.amount * 2;
    u.money += prize;
    totalWin += prize;
  }
  save();

  gameHistory.push({
    type: game.type,
    result: winSide,
    details: game.type === 'taixiu' ? diceStr : winSide.toUpperCase(),
    time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
  });
  if (gameHistory.length > 20) gameHistory.shift();

  const finalEmbed = new EmbedBuilder()
    .setTitle(game.type === 'taixiu' ? '🎲 KẾT QUẢ TÀI XỈU' : '🥣 KẾT QUẢ XÓC ĐĨA')
    .setDescription(resultText + `\n\nHŨ: **${game.hũ} Mcoint**`)
    .setColor('Gold')
    .addFields({
      name: 'Người thắng',
      value: winners.length ? winners.map(w => `\( {w.name} + \){w.amount*2}`).join('\n') : 'Không ai thắng',
      inline: false
    });

  await msg.edit({ embeds: [finalEmbed], components: [] });

  channel.send(`**Kết quả ${game.type.toUpperCase()}**: \( {resultText}\nTổng tiền thắng: ** \){totalWin}** Mcoint`);
}

// ADMIN
client.on('messageCreate', msg => {
  if (!msg.content.startsWith('!addcode')) return;
  const args = msg.content.split(/\s+/);
  const code = args[1]?.toUpperCase();
  const amt = parseInt(args[2]);
  if (!code || isNaN(amt)) return msg.reply('!addcode CODE AMOUNT');
  data.codes[code] = amt; save();
  msg.reply(`✅ Thêm code **${code}** = ${amt} Mcoint`);
});

client.login(process.env.BOT_TOKEN);
