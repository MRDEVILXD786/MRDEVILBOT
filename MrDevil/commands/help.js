const moment = require('moment-timezone');
const os = require('os');

const sleep   = ms => new Promise(r => setTimeout(r, ms));
const editMsg = (api, text, msgID) => { try { api.editMessage(text, msgID); } catch {} };
const sendMsg = (api, text, threadID, replyTo) => new Promise(r => api.sendMessage(text, threadID, (e, i) => r(i), replyTo));

const LOAD0 = title => `╭─── « ${title} » ───⟡\n│\n│ ⌛ ▱▱▱▱▱▱▱▱▱▱ 𝟬%\n│    Loading...\n│\n╰───────────────⟡`;
const LOAD1 = title => `╭─── « ${title} » ───⟡\n│\n│ 🔄 ▰▰▰▰▰▱▱▱▱▱ 𝟱𝟬%\n│    Processing...\n│\n╰───────────────⟡`;

// ── Bold Unicode converter ───────────────────────────────────────────────────
function bold(str) {
  const map = {
    A:'𝗔',B:'𝗕',C:'𝗖',D:'𝗗',E:'𝗘',F:'𝗙',G:'𝗚',H:'𝗛',I:'𝗜',J:'𝗝',K:'𝗞',
    L:'𝗟',M:'𝗠',N:'𝗡',O:'𝗢',P:'𝗣',Q:'𝗤',R:'𝗥',S:'𝗦',T:'𝗧',U:'𝗨',V:'𝗩',
    W:'𝗪',X:'𝗫',Y:'𝗬',Z:'𝗭',
    a:'𝗮',b:'𝗯',c:'𝗰',d:'𝗱',e:'𝗲',f:'𝗳',g:'𝗴',h:'𝗵',i:'𝗶',j:'𝗷',k:'𝗸',
    l:'𝗹',m:'𝗺',n:'𝗻',o:'𝗼',p:'𝗽',q:'𝗾',r:'𝗿',s:'𝘀',t:'𝘁',u:'𝘂',v:'𝘃',
    w:'𝘄',x:'𝘅',y:'𝘆',z:'𝘇',
    '0':'𝟬','1':'𝟭','2':'𝟮','3':'𝟯','4':'𝟰','5':'𝟱','6':'𝟲','7':'𝟳','8':'𝟴','9':'𝟵'
  };
  return [...str].map(c => map[c] || c).join('');
}

function numB(n) {
  const m = ['𝟬','𝟭','𝟮','𝟯','𝟰','𝟱','𝟲','𝟳','𝟴','𝟵'];
  return String(n).split('').map(d => m[+d] || d).join('');
}

// ── Helpers ──────────────────────────────────────────────────────────────────
function getRAM() {
  const used  = process.memoryUsage().heapUsed / 1024 / 1024;
  const total = os.totalmem() / 1024 / 1024;
  return `${used.toFixed(2)}MB / ${total.toFixed(2)}MB`;
}

function getUptime() {
  const s = Math.floor(process.uptime());
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  return `${h}h ${m}m`;
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 5)  return 'Good Night';
  if (h < 12) return 'Good Morning';
  if (h < 17) return 'Good Afternoon';
  if (h < 21) return 'Good Evening';
  return 'Good Night';
}

function getUniqueCommands(client) {
  const seen = new Set();
  const list = [];
  for (const [, cmd] of client.commands) {
    if (!cmd.config?.name || seen.has(cmd.config.name)) continue;
    seen.add(cmd.config.name);
    list.push(cmd);
  }
  return list;
}

function buildCategories(allCmds) {
  const cats = {};
  for (const cmd of allCmds) {
    const cat = cmd.config.category || 'General';
    if (!cats[cat]) cats[cat] = [];
    cats[cat].push(cmd);
  }
  return cats;
}

// ── Box builders ─────────────────────────────────────────────────────────────
function topBar(title) {
  return `╭─── « ${bold(title)} » ───⟡`;
}
function botLine(n = 19) {
  return `╰${'─'.repeat(n)}⟡`;
}

// ── Main Menu ─────────────────────────────────────────────────────────────────
function buildMainMenu(userName, config, total, catNames, time) {
  const greeting = getGreeting();
  const ram      = getRAM();
  const uptime   = getUptime();

  let msg = '';
  msg += topBar('MR DEVIL BOT') + '\n';
  msg += `│\n`;
  msg += `│ ✅ ▰▰▰▰▰▰▰▰▰▰ 𝟭𝟬𝟬%\n`;
  msg += `│\n`;
  msg += `│ ⊳ ${bold('Hi •─┼ its me')} ${userName}, ${bold(greeting)}!\n`;
  msg += `│\n`;
  msg += `│ ◈ ${bold('Version')} : ${config.VERSION || '2.0.0'}\n`;
  msg += `│ ◈ ${bold('Owner')}   : ${bold('MR DEVIL')}\n`;
  msg += `│ ◈ ${bold('Ram')}     : ${ram}\n`;
  msg += `│ ◈ ${bold('Uptime')}  : ${uptime}\n`;
  msg += `│ ◈ ${bold('Prefix')}  : ${config.PREFIX || '.'}\n`;
  msg += `│ ◈ ${bold('Cmds')}    : ${bold(String(total))} commands\n`;
  msg += `│ ◈ ${bold('Time')}    : ${time}\n`;
  msg += `│\n`;
  msg += botLine(19) + '\n\n';

  msg += topBar('COMMAND PANEL') + '\n';
  msg += `│\n`;
  catNames.forEach((cat, i) => {
    msg += `│ [ ${numB(i + 1)} ] ${bold(cat.toUpperCase())}\n`;
  });
  msg += `│\n`;
  msg += botLine(19) + '\n\n';

  msg += `│ 💡 ${bold('Reply with number')} to see category\n`;
  msg += `│ 💡 ${config.PREFIX || '.'}${bold('help all')} for full list\n`;
  msg += `│ 💡 ${config.PREFIX || '.'}${bold('help [cmd]')} for details\n`;
  msg += botLine(19);

  return msg;
}

// ── Category Commands View ────────────────────────────────────────────────────
function buildCategoryMsg(catName, cmds, prefix, config) {
  const disabled = config.DISABLED_COMMANDS || [];
  let msg = '';
  msg += topBar(catName) + '\n';
  msg += `│\n`;
  msg += `│ ✅ ▰▰▰▰▰▰▰▰▰▰ 𝟭𝟬𝟬%\n`;
  msg += `│\n`;
  cmds.forEach((cmd, i) => {
    const off = disabled.includes(cmd.config.name);
    const dot = off ? '✘' : '✦';
    msg += `│ ${dot} [ ${numB(i + 1)} ] ${bold(prefix + cmd.config.name)}\n`;
    if (cmd.config.description) {
      msg += `│      ↳ ${cmd.config.description.slice(0, 40)}\n`;
    }
  });
  msg += `│\n`;
  msg += botLine(19) + '\n\n';
  msg += `│ 💡 ${prefix}${bold('help [cmd]')} for full details`;
  return msg;
}

// ── All Commands View ─────────────────────────────────────────────────────────
function buildAllMsg(cats, prefix, config, total, time) {
  const disabled = config.DISABLED_COMMANDS || [];
  let msg = '';
  msg += topBar('ALL COMMANDS') + '\n';
  msg += `│\n`;
  msg += `│ ✅ ▰▰▰▰▰▰▰▰▰▰ 𝟭𝟬𝟬%\n`;
  msg += `│\n`;
  msg += `│ ◈ ${bold('Total')} : ${bold(String(total))} commands\n`;
  msg += `│ ◈ ${bold('Time')}  : ${time}\n`;
  msg += `│\n`;
  msg += botLine(19) + '\n\n';

  for (const [cat, cmds] of Object.entries(cats)) {
    msg += topBar(cat) + '\n';
    msg += `│\n`;
    cmds.forEach(cmd => {
      const off = disabled.includes(cmd.config.name);
      const dot = off ? '✘' : '✦';
      msg += `│ ${dot} ${bold(prefix + cmd.config.name)}\n`;
    });
    msg += `│\n`;
    msg += botLine(19) + '\n\n';
  }

  msg += `│ 💡 ${prefix}${bold('help [cmd]')} for details\n`;
  msg += `│ 👑 ${bold('MR DEVIL BOT')}`;
  return msg;
}

// ── Command Info View ─────────────────────────────────────────────────────────
function buildCmdInfo(cmd, prefix, config) {
  const c        = cmd.config;
  const disabled = (config.DISABLED_COMMANDS || []).includes(c.name);
  let msg = '';
  msg += topBar('COMMAND INFO') + '\n';
  msg += `│\n`;
  msg += `│ ✅ ▰▰▰▰▰▰▰▰▰▰ 𝟭𝟬𝟬%\n`;
  msg += `│\n`;
  msg += `│ ◈ ${bold('Name')}     : ${bold(c.name.toUpperCase())}\n`;
  msg += `│ ◈ ${bold('Category')} : ${c.category || 'General'}\n`;
  msg += `│ ◈ ${bold('Usage')}    : ${prefix}${c.usage || c.name}\n`;
  msg += `│ ◈ ${bold('Aliases')}  : ${c.aliases?.join(', ') || 'none'}\n`;
  msg += `│ ◈ ${bold('Status')}   : ${disabled ? '✘ Disabled' : '✦ Active'}\n`;
  msg += `│\n`;
  msg += `│ ◈ ${bold('Info')} :\n`;
  msg += `│   ${c.description || 'No description'}\n`;
  msg += `│\n`;
  msg += botLine(19) + '\n\n';
  msg += `│ 👑 ${bold('MR DEVIL BOT')}`;
  return msg;
}

// ── Export ────────────────────────────────────────────────────────────────────
module.exports = {
  config: {
    credits: "MR DEVIL",
    name: 'help',
    aliases: ['cmds', 'commands', 'menu'],
    description: 'Commands ki list dekho.',
    usage: 'help | help all | help [command]',
    category: 'Utility',
    prefix: true
  },

  async run({ api, event, args, client, config, Users }) {
    const { threadID, senderID, messageID } = event;
    const userName = await Users.getNameUser(senderID);
    const prefix   = config.PREFIX || '.';
    const time     = moment().tz(config.TIMEZONE || 'Asia/Karachi').format('hh:mm A | DD/MM/YYYY');
    const allCmds  = getUniqueCommands(client);
    const cats     = buildCategories(allCmds);
    const catNames = Object.keys(cats);

    // ── .help [command]
    if (args[0] && args[0].toLowerCase() !== 'all') {
      const cmdName = args[0].toLowerCase();
      let cmd = client.commands.get(cmdName);
      if (!cmd) {
        for (const [, c] of client.commands) {
          if (c.config?.aliases?.includes(cmdName)) { cmd = c; break; }
        }
      }

      const sent = await sendMsg(api, LOAD0('COMMAND INFO'), threadID, messageID);
      await sleep(600);
      await editMsg(api, LOAD1('COMMAND INFO'), sent.messageID);
      await sleep(600);

      if (!cmd) {
        return editMsg(api,
          topBar('NOT FOUND') + '\n│\n' +
          `│ ✅ ▰▰▰▰▰▰▰▰▰▰ 𝟭𝟬𝟬%\n│\n` +
          `│ ⊳ "${args[0]}" command nahi mila!\n│\n` +
          `│ ◈ ${prefix}${bold('help')} — main menu\n` +
          `│ ◈ ${prefix}${bold('help all')} — sab commands\n│\n` +
          botLine(19),
          sent.messageID
        );
      }
      return editMsg(api, buildCmdInfo(cmd, prefix, config), sent.messageID);
    }

    // ── .help all
    if (args[0]?.toLowerCase() === 'all') {
      const sent = await sendMsg(api, LOAD0('ALL COMMANDS'), threadID, messageID);
      await sleep(600);
      await editMsg(api, LOAD1('ALL COMMANDS'), sent.messageID);
      await sleep(700);
      await editMsg(api,
        `╭─── « ${bold('ALL COMMANDS')} » ───⟡\n│\n│ ✅ ▰▰▰▰▰▰▰▰▰▰ 𝟭𝟬𝟬%\n│    Done! List sending...\n│\n╰───────────────⟡`,
        sent.messageID
      );
      return api.sendMessage(buildAllMsg(cats, prefix, config, allCmds.length, time), threadID, messageID);
    }

    // ── .help — main menu
    const sent = await sendMsg(api, LOAD0('MR DEVIL BOT'), threadID, messageID);
    await sleep(600);
    await editMsg(api, LOAD1('MR DEVIL BOT'), sent.messageID);
    await sleep(700);

    const finalMsg = buildMainMenu(userName, config, allCmds.length, catNames, time);
    await editMsg(api, finalMsg, sent.messageID);

    client.replies.set(sent.messageID, {
      commandName: 'help',
      author: senderID,
      data: { cats, catNames, prefix, config }
    });
  },

  async handleReply({ api, event, client, Reply }) {
    const { threadID, senderID, messageID, body } = event;
    if (Reply.author !== senderID) return;

    const { cats, catNames, prefix, config } = Reply.data;
    const num = parseInt(body.trim());

    if (isNaN(num) || num < 1 || num > catNames.length) {
      return api.sendMessage(
        topBar('INVALID') + '\n│\n' +
        `│ ⊳ 1 se ${numB(catNames.length)} tak number do!\n│\n` +
        botLine(19),
        threadID, messageID
      );
    }

    const catName = catNames[num - 1];
    const cmds    = cats[catName];

    const sent = await sendMsg(api, LOAD0(catName), threadID, messageID);
    await sleep(600);
    await editMsg(api, LOAD1(catName), sent.messageID);
    await sleep(600);
    editMsg(api, buildCategoryMsg(catName, cmds, prefix, config), sent.messageID);
  }
};
