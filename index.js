const {
  Client,
  GatewayIntentBits,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle
} = require('discord.js');

const fs = require('fs');

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent]
});

// ===== DATA =====
const FILE = './data.json';

function load() {
  if (!fs.existsSync(FILE)) return { users: {}, codes: {} };
  return JSON.parse(fs.readFileSync(FILE));
}

function save() {
  fs.writeFileSync(FILE, JSON.stringify(data, null, 2));
}

let data = load();

// ===== CONFIG =====
const DAILY = 50;
const DAILY_CD = 86400000;
const GAME_CD = 3000;
const RIGGED_RATE = 0.6;

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
