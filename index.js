const {
  Client, GatewayIntentBits, EmbedBuilder, ActionRowBuilder,
  ButtonBuilder, ButtonStyle, ModalBuilder, TextInputBuilder,
  TextInputStyle, AttachmentBuilder
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
const RIGGED_RATE = 0.60;     // Nhà ăn 60%
const GAME_TIME = 40000;      // 40 giây

let currentGames = {};        // { channelId: { type, bets, endTime, messageId } }

// ================== READY ==================
client.once('ready', () => {
  console.log(`Casino Pro Max FULL Ready: ${client.user.tag}`);
});

// ================== COMMANDS ==================
client.on('messageCreate', async msg => {
  if (msg.author.bot) return;

  const args = msg.content.trim().split(/\s+/);
  const cmd = args[0].toLowerCase();
  const user = getUser(msg.author.id);

  if (cmd === 'help') {
    return msg.reply(`💰 **CASINO PRO MAX FULL**\n\nbalance\ndaily\ntop\ntaixiu\nxocdia\nredeem <code>`);
  }

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

  // TÀI XỈU
  if (cmd === 'taixiu') {
    if (currentGames[msg.channelId]) return msg.reply('⚠️ Đang có ván tài xỉu khác!');
    
    const embed = new EmbedBuilder()
      .setTitle('🎲 TÀI XỈU #1')
      .setDescription('Hãy chọn cửa và ghi số tiền cược\nKết thúc trong: **40 giây tới**')
      .setColor(0x00ff00)
      .addFields(
        { name: 'HŨ TÀI XỈU', value: '0 Mcoint', inline: true },
        { name: 'TỔNG CƯỢC', value: 'Tài: 0\nXỉu: 0\nChẵn: 0\nLẻ: 0\nSố/Tổng: 0', inline: false }
      )
      .setFooter({ text: 'Powered by mxtbot.com' });

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId('bet_tai').setLabel('TÀI').setStyle(ButtonStyle.Success),
      new ButtonBuilder().setCustomId('bet_xiu').setLabel('XỈU').setStyle(ButtonStyle.Danger)
    );

    const sent = await msg.channel.send({ embeds: [embed], components: [row] });

    currentGames[msg.channelId] = {
      type: 'taixiu',
      bets: { tai: [], xiu: [] },
      endTime: Date.now() + GAME_TIME,
      messageId: sent.id,
      hũ: 0
    };

    setTimeout(() => endGame(msg.channelId), GAME_TIME);
  }

  // XÓC ĐĨA
  if (cmd === 'xocdia') {
    if (currentGames[msg.channelId]) return msg.reply('⚠️ Đang có ván xóc đĩa khác!');
    
    const embed = new EmbedBuilder()
      .setTitle('🥣 XÓC ĐĨA')
      .setDescription('Hãy chọn cửa và ghi số tiền cược\nKết thúc trong: **40 giây tới**')
      .setColor(0xaa00ff)
      .addFields(
        { name: 'HŨ', value: '0 Mcoint', inline: true },
        { name: 'TỔNG CƯỢC', value: 'Tài: 0\nXỉu: 0\nChẵn: 0\nLẻ: 0\nSố/Tổng: 0', inline: false }
      )
      .setFooter({ text: 'Powered by mxtbot.com' });

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId('bet_chan').setLabel('CHẴN').setStyle(ButtonStyle.Success),
      new ButtonBuilder().setCustomId('bet_le').setLabel('LẺ').setStyle(ButtonStyle.Danger)
    );

    const sent = await msg.channel.send({ embeds: [embed], components: [row] });

    currentGames[msg.channelId] = {
      type: 'xocdia',
      bets: { chan: [], le: [] },
      endTime: Date.now() + GAME_TIME,
      messageId: sent.id,
      hũ: 0
    };

    setTimeout(() => endGame(msg.channelId), GAME_TIME);
  }
});

// ================== BUTTON → MODAL ==================
client.on('interactionCreate', async interaction => {
  if (!interaction.isButton()) return;

  const game = currentGames[interaction.channelId];
  if (!game) return interaction.reply({ content: 'Ván cược đã kết thúc!', ephemeral: true });

  const type = interaction.customId.split('_')[1]; // tai, xiu, chan, le

  const modal = new ModalBuilder()
    .setCustomId(`modal_${type}`)
    .setTitle('💰 Nhập số tiền cược');

  const input = new TextInputBuilder()
    .setCustomId('amount')
    .setLabel('Số Mcoint')
    .setStyle(TextInputStyle.Short)
    .setPlaceholder('Ví dụ: 50000')
    .setRequired(true);

  modal.addComponents(new ActionRowBuilder().addComponents(input));
  await interaction.showModal(modal);
});

// ================== MODAL SUBMIT ==================
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

  // Lưu cược
  if (game.type === 'taixiu') {
    if (type === 'tai' || type === 'xiu') {
      game.bets[type].push({ user: interaction.user.id, amount, name: interaction.user.username });
    }
  } else if (game.type === 'xocdia') {
    if (type === 'chan' || type === 'le') {
      game.bets[type].push({ user: interaction.user.id, amount, name: interaction.user.username });
    }
  }

  user.money -= amount;
  save();

  // Update embed tổng cược
  await updateGameEmbed(interaction.channelId);

  interaction.reply({ content: `✅ Đã cược **\( {amount}** Mcoint vào ** \){type.toUpperCase()}**`, ephemeral: true });
});

// ================== UPDATE EMBED ==================
async function updateGameEmbed(channelId) {
  const game = currentGames[channelId];
  if (!game) return;

  const msg = await client.channels.cache.get(channelId).messages.fetch(game.messageId).catch(()=>null);
  if (!msg) return;

  let totalTai = game.bets.tai ? game.bets.tai.reduce((a,b)=>a+b.amount,0) : 0;
  let totalXiu = game.bets.xiu ? game.bets.xiu.reduce((a,b)=>a+b.amount,0) : 0;
  let totalChan = game.bets.chan ? game.bets.chan.reduce((a,b)=>a+b.amount,0) : 0;
  let totalLe  = game.bets.le  ? game.bets.le.reduce((a,b)=>a+b.amount,0) : 0;

  const embed = EmbedBuilder.from(msg.embeds[0]);
  embed.setFields([
    { name: 'HŨ TÀI XỈU', value: `${game.hũ} Mcoint`, inline: true },
    { name: 'TỔNG CƯỢC', value: `Tài: ${totalTai}\nXỉu: ${totalXiu}\nChẵn: ${totalChan}\nLẻ: ${totalLe}\nSố/Tổng: 0`, inline: false }
  ]);

  await msg.edit({ embeds: [embed] });
}

// ================== END GAME ==================
async function endGame(channelId) {
  const game = currentGames[channelId];
  if (!game) return;
  delete currentGames[channelId];

  const channel = client.channels.cache.get(channelId);
  const msg = await channel.messages.fetch(game.messageId).catch(()=>null);
  if (!msg) return;

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
  } 
  else { // xocdia
    winSide = Math.random() < 0.5 ? 'chan' : 'le';
    if (Math.random() < RIGGED_RATE) winSide = winSide === 'chan' ? 'le' : 'chan';
    resultText = `Kết quả: **${winSide.toUpperCase()}**`;
  }

  // Phân thưởng
  const winners = game.bets[winSide] || [];
  let totalWin = 0;

  for (const bet of winners) {
    const u = getUser(bet.user);
    const prize = bet.amount * 2; // x2
    u.money += prize;
    totalWin += prize;
  }
  save();

  const finalEmbed = new EmbedBuilder()
    .setTitle(game.type === 'taixiu' ? '🎲 KẾT QUẢ TÀI XỈU' : '🥣 KẾT QUẢ XÓC ĐĨA')
    .setDescription(resultText + `\n\nHŨ: **${game.hũ} Mcoint**`)
    .setColor('Gold')
    .addFields({ name: 'Người thắng', value: winners.length ? winners.map(w => `\( {w.name} + \){w.amount*2}`).join('\n') : 'Không ai thắng', inline: false });

  await msg.edit({ embeds: [finalEmbed], components: [] });

  channel.send(`**Kết quả ${game.type.toUpperCase()}**: \( {resultText}\nTổng tiền thắng: ** \){totalWin}** Mcoint`);
}

// ================== ADMIN ==================
client.on('messageCreate', msg => {
  if (!msg.content.startsWith('!addcode')) return;
  const args = msg.content.split(/\s+/);
  const code = args[1]?.toUpperCase();
  const amt = parseInt(args[2]);
  if (!code || isNaN(amt)) return msg.reply('!addcode CODE AMOUNT');
  data.codes[code] = amt; save();
  msg.reply(`✅ Thêm code **${code}** = ${amt} Mcoint`);
});

client.login(process.env.BOT_TOKEN);const RIGGED_RATE = 0.6;

let cooldownGame = {};

// ===== USER =====
function getUser(id) {
  if (!data.users[id]) {
    data.users[id] = { money: 1000, lastDaily: 0 };
  }
  return data.users[id];
}

// ===== READY =====
client.once('ready', () => {
  console.log('Casino Pro Max Ready:', client.user.tag);
});

// ===== MESSAGE =====
client.on('messageCreate', async msg => {
  if (msg.author.bot) return;

  const args = msg.content.split(' ');
  const cmd = args[0].toLowerCase();
  const user = getUser(msg.author.id);

  // ===== HELP =====
  if (cmd === 'help') {
    return msg.reply(`
💰 CASINO PRO MAX

balance
daily
top
taixiu
xocdia
redeem <code>
`);
  }

  // ===== BALANCE =====
  if (cmd === 'balance') {
    return msg.reply(`💰 ${msg.author.username}: ${user.money} xu`);
  }

  // ===== DAILY =====
  if (cmd === 'daily') {
    if (Date.now() - user.lastDaily < DAILY_CD) {
      return msg.reply('⏳ Chưa tới giờ!');
    }

    user.money += DAILY;
    user.lastDaily = Date.now();
    save();

    return msg.reply(`🎁 +${DAILY} xu`);
  }

  // ===== TOP =====
  if (cmd === 'top') {
    const top = Object.entries(data.users)
      .sort((a, b) => b[1].money - a[1].money)
      .slice(0, 10);

    let text = '🏆 TOP GIÀU:\n';
    top.forEach((u, i) => {
      text += `${i + 1}. ${u[1].money} xu\n`;
    });

    return msg.reply(text);
  }

  // ===== REDEEM =====
  if (cmd === 'redeem') {
    const code = args[1]?.toUpperCase();

    if (!code || !data.codes[code]) {
      return msg.reply('❌ Code sai');
    }

    const amount = data.codes[code];
    delete data.codes[code];

    user.money += amount;
    save();

    return msg.reply(`🎁 +${amount} xu`);
  }

  // ===== TAIXIU =====
  if (cmd === 'taixiu') {
    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId('tai').setLabel('TÀI').setStyle(ButtonStyle.Success),
      new ButtonBuilder().setCustomId('xiu').setLabel('XỈU').setStyle(ButtonStyle.Danger)
    );

    return msg.reply({
      embeds: [
        new EmbedBuilder()
          .setTitle('🎲 TÀI XỈU')
          .setDescription('Chọn → nhập tiền')
          .setColor('Blue')
      ],
      components: [row]
    });
  }

  // ===== XOCDIA =====
  if (cmd === 'xocdia') {
    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId('chan').setLabel('CHẴN').setStyle(ButtonStyle.Success),
      new ButtonBuilder().setCustomId('le').setLabel('LẺ').setStyle(ButtonStyle.Danger)
    );

    return msg.reply({
      embeds: [
        new EmbedBuilder()
          .setTitle('🥣 XÓC ĐĨA')
          .setDescription('Chọn → nhập tiền')
          .setColor('Purple')
      ],
      components: [row]
    });
  }
});

// ===== INTERACTION =====
client.on('interactionCreate', async interaction => {

  // ===== BUTTON → OPEN MODAL =====
  if (interaction.isButton()) {
    const type = interaction.customId;

    const modal = new ModalBuilder()
      .setCustomId(`bet_${type}`)
      .setTitle('💰 Nhập tiền cược');

    const input = new TextInputBuilder()
      .setCustomId('money')
      .setLabel('Số xu')
      .setStyle(TextInputStyle.Short)
      .setPlaceholder('VD: 1000')
      .setRequired(true);

    const row = new ActionRowBuilder().addComponents(input);
    modal.addComponents(row);

    return interaction.showModal(modal);
  }

  // ===== MODAL SUBMIT =====
  if (interaction.isModalSubmit()) {
    const user = getUser(interaction.user.id);

    const type = interaction.customId.split('_')[1];
    const bet = parseInt(interaction.fields.getTextInputValue('money'));

    // CHECK
    if (!bet || bet <= 0) {
      return interaction.reply({ content: '❌ Tiền không hợp lệ', ephemeral: true });
    }

    if (bet > user.money) {
      return interaction.reply({ content: '💀 Không đủ tiền', ephemeral: true });
    }

    if (cooldownGame[interaction.user.id] && Date.now() < cooldownGame[interaction.user.id]) {
      return interaction.reply({ content: '⏳ Đợi tí!', ephemeral: true });
    }
    cooldownGame[interaction.user.id] = Date.now() + GAME_CD;

    // ===== TAIXIU =====
    if (type === 'tai' || type === 'xiu') {
      const roll =
        Math.floor(Math.random() * 6) + 1 +
        Math.floor(Math.random() * 6) + 1 +
        Math.floor(Math.random() * 6) + 1;

      let result = roll >= 11 ? 'tai' : 'xiu';

      if (Math.random() < RIGGED_RATE) {
        result = type === 'tai' ? 'xiu' : 'tai';
      }

      let win = type === result;

      if (win) user.money += bet;
      else user.money -= bet;

      save();

      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setTitle(win ? '🎉 WIN' : '💀 LOSE')
            .setDescription(`🎲 ${roll}\n💰 ${win ? '+' : '-'}${bet}`)
            .setColor(win ? 'Green' : 'Red')
        ]
      });
    }

    // ===== XOCDIA =====
    if (type === 'chan' || type === 'le') {
      let result = Math.random() < 0.5 ? 'chan' : 'le';

      if (Math.random() < RIGGED_RATE) {
        result = type === 'chan' ? 'le' : 'chan';
      }

      let win = type === result;

      if (win) user.money += bet;
      else user.money -= bet;

      save();

      return interaction.reply(
        win ? `🎉 WIN +${bet}` : `💀 LOSE -${bet}`
      );
    }
  }
});

// ===== ADMIN =====
client.on('messageCreate', msg => {
  if (!msg.content.startsWith('!addcode')) return;

  const args = msg.content.split(' ');
  const code = args[1]?.toUpperCase();
  const amount = parseInt(args[2]);

  if (!code || isNaN(amount)) return msg.reply('!addcode CODE AMOUNT');

  data.codes[code] = amount;
  save();

  msg.reply(`✅ Add code ${code}`);
});

client.login(process.env.BOT_TOKEN);let cooldownGame = {};

// ===== USER =====
function getUser(id) {
  if (!data.users[id]) {
    data.users[id] = {
      money: 1000,
      lastDaily: 0
    };
  }
  return data.users[id];
}

// ===== READY =====
client.once('ready', () => {
  console.log('Casino Pro Max Ready:', client.user.tag);
});

// ===== MESSAGE =====
client.on('messageCreate', async msg => {
  if (msg.author.bot) return;

  const args = msg.content.split(' ');
  const cmd = args[0].toLowerCase();
  const user = getUser(msg.author.id);

  // ===== HELP =====
  if (cmd === 'help') {
    return msg.reply(`
💰 CASINO PRO MAX

balance
daily
top
taixiu
xocdia
redeem <code>
`);
  }

  // ===== BALANCE =====
  if (cmd === 'balance') {
    return msg.reply(`💰 ${msg.author.username}: ${user.money} xu`);
  }

  // ===== DAILY =====
  if (cmd === 'daily') {
    if (Date.now() - user.lastDaily < DAILY_CD) {
      return msg.reply('⏳ Chưa tới giờ!');
    }

    user.money += DAILY;
    user.lastDaily = Date.now();
    save();

    return msg.reply(`🎁 +${DAILY} xu`);
  }

  // ===== TOP =====
  if (cmd === 'top') {
    const top = Object.entries(data.users)
      .sort((a, b) => b[1].money - a[1].money)
      .slice(0, 10);

    let text = '🏆 TOP GIÀU:\n';
    top.forEach((u, i) => {
      text += `${i + 1}. ${u[1].money} xu\n`;
    });

    return msg.reply(text);
  }

  // ===== REDEEM =====
  if (cmd === 'redeem') {
    const code = args[1]?.toUpperCase();

    if (!code || !data.codes[code]) {
      return msg.reply('❌ Code sai');
    }

    const amount = data.codes[code];
    delete data.codes[code];

    user.money += amount;
    save();

    return msg.reply(`🎁 +${amount} xu`);
  }

  // ===== TAIXIU BUTTON =====
  if (cmd === 'taixiu') {
    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId('tai').setLabel('TÀI').setStyle(ButtonStyle.Success),
      new ButtonBuilder().setCustomId('xiu').setLabel('XỈU').setStyle(ButtonStyle.Danger)
    );

    return msg.reply({
      embeds: [
        new EmbedBuilder()
          .setTitle('🎲 TÀI XỈU')
          .setDescription('Cược 100 xu')
          .setColor('Blue')
      ],
      components: [row]
    });
  }

  // ===== XOCDIA BUTTON =====
  if (cmd === 'xocdia') {
    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId('chan').setLabel('CHẴN').setStyle(ButtonStyle.Success),
      new ButtonBuilder().setCustomId('le').setLabel('LẺ').setStyle(ButtonStyle.Danger)
    );

    return msg.reply({
      embeds: [
        new EmbedBuilder()
          .setTitle('🥣 XÓC ĐĨA')
          .setDescription('Cược 100 xu')
          .setColor('Purple')
      ],
      components: [row]
    });
  }
});

// ===== BUTTON =====
client.on('interactionCreate', async interaction => {
  if (!interaction.isButton()) return;

  const user = getUser(interaction.user.id);
  const bet = 100;

  // ===== COOLDOWN =====
  if (cooldownGame[interaction.user.id] && Date.now() < cooldownGame[interaction.user.id]) {
    return interaction.reply({ content: '⏳ Đợi tí!', ephemeral: true });
  }
  cooldownGame[interaction.user.id] = Date.now() + GAME_CD;

  // ===== CHECK MONEY =====
  if (user.money < bet) {
    return interaction.reply({ content: '💀 Hết tiền thật rồi!', ephemeral: true });
  }

  // ===== TAIXIU =====
  if (interaction.customId === 'tai' || interaction.customId === 'xiu') {
    const roll =
      Math.floor(Math.random() * 6) + 1 +
      Math.floor(Math.random() * 6) + 1 +
      Math.floor(Math.random() * 6) + 1;

    let result = roll >= 11 ? 'tai' : 'xiu';

    // rigged 60%
    if (Math.random() < RIGGED_RATE) {
      result = interaction.customId === 'tai' ? 'xiu' : 'tai';
    }

    let win = interaction.customId === result;

    if (win) user.money += bet;
    else user.money -= bet;

    save();

    return interaction.update({
      embeds: [
        new EmbedBuilder()
          .setTitle(win ? '🎉 WIN' : '💀 LOSE')
          .setDescription(`🎲 ${roll}\n${win ? '+' : '-'}${bet}`)
          .setColor(win ? 'Green' : 'Red')
      ],
      components: []
    });
  }

  // ===== XOCDIA =====
  if (interaction.customId === 'chan' || interaction.customId === 'le') {
    let result = Math.random() < 0.5 ? 'chan' : 'le';

    if (Math.random() < RIGGED_RATE) {
      result = interaction.customId === 'chan' ? 'le' : 'chan';
    }

    let win = interaction.customId === result;

    if (win) user.money += bet;
    else user.money -= bet;

    save();

    return interaction.update({
      content: win ? `🎉 WIN +${bet}` : `💀 LOSE -${bet}`,
      components: []
    });
  }
});

// ===== ADMIN ADD CODE =====
client.on('messageCreate', msg => {
  if (!msg.content.startsWith('!addcode')) return;

  const args = msg.content.split(' ');
  const code = args[1]?.toUpperCase();
  const amount = parseInt(args[2]);

  if (!code || isNaN(amount)) return msg.reply('!addcode CODE AMOUNT');

  data.codes[code] = amount;
  save();

  msg.reply(`✅ Add code ${code}`);
});

client.login(process.env.BOT_TOKEN);
