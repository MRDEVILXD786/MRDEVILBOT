const moment = require('moment-timezone');

function bold(t) {
  const map = { a:'𝗮',b:'𝗯',c:'𝗰',d:'𝗱',e:'𝗲',f:'𝗳',g:'𝗴',h:'𝗵',i:'𝗶',j:'𝗷',k:'𝗸',l:'𝗹',m:'𝗺',n:'𝗻',o:'𝗼',p:'𝗽',q:'𝗾',r:'𝗿',s:'𝘀',t:'𝘁',u:'𝘂',v:'𝘃',w:'𝘄',x:'𝘅',y:'𝘆',z:'𝘇',A:'𝗔',B:'𝗕',C:'𝗖',D:'𝗗',E:'𝗘',F:'𝗙',G:'𝗚',H:'𝗛',I:'𝗜',J:'𝗝',K:'𝗞',L:'𝗟',M:'𝗠',N:'𝗡',O:'𝗢',P:'𝗣',Q:'𝗤',R:'𝗥',S:'𝗦',T:'𝗧',U:'𝗨',V:'𝗩',W:'𝗪',X:'𝗫',Y:'𝗬',Z:'𝗭',0:'𝟬',1:'𝟭',2:'𝟮',3:'𝟯',4:'𝟰',5:'𝟱',6:'𝟲',7:'𝟳',8:'𝟴',9:'𝟵' };
  return String(t).split('').map(c => map[c] || c).join('');
}

module.exports = {
  config: {
    credits: 'MR DEVIL',
    name: 'autosent',
    aliases: ['autohourly', 'hourlymsg', 'automsg'],
    description: 'Is group mein hourly messages on/off karo.',
    usage: 'autosent [on/off]',
    category: 'Group',
    prefix: true,
    groupOnly: true,
    adminOnly: true,
    cooldowns: 5
  },

  async run({ api, event, send, args, Threads, config, isAdmin }) {
    const { threadID, senderID } = event;

    if (!isAdmin) {
      return send.reply(
        `╭─── « ❌ ACCESS DENIED » ───⟡\n` +
        `│\n` +
        `│ 🚫 Sirf Bot Admin use\n` +
        `│    kar sakta hai!\n` +
        `│\n` +
        `╰───────────────⟡`
      );
    }

    const settings = await Threads.getSettings(threadID);
    const current = !!settings?.autosent;

    const arg = (args[0] || '').toLowerCase();

    if (!arg) {
      const tz = config.TIMEZONE || 'Asia/Karachi';
      const timeNow = moment().tz(tz).format('hh:mm A');
      const dateNow = moment().tz(tz).format('DD/MM/YYYY');
      return send.reply(
        `╭─── « 📢 AUTOSENT STATUS » ───⟡\n` +
        `│\n` +
        `│ 📍 Group: Is Group\n` +
        `│ ⚡ Halat: ${current ? bold('ON') + ' ✅' : bold('OFF') + ' ❌'}\n` +
        `│\n` +
        `│ ◈ 🕐 Waqt  : ${bold(timeNow)}\n` +
        `│ ◈ 📅 Tarikh: ${bold(dateNow)}\n` +
        `│ ◈ 🌍 Zone  : ${bold(tz)}\n` +
        `│\n` +
        `│ 💡 Use: ${bold('.autosent on')} / ${bold('.autosent off')}\n` +
        `│\n` +
        `╰───────────────⟡`
      );
    }

    if (arg !== 'on' && arg !== 'off') {
      return send.reply(
        `╭─── « ❓ GALAT COMMAND » ───⟡\n` +
        `│\n` +
        `│ 💡 Sahi tarika:\n` +
        `│    ${bold('.autosent on')}\n` +
        `│    ${bold('.autosent off')}\n` +
        `│\n` +
        `╰───────────────⟡`
      );
    }

    const newVal = arg === 'on';

    if (newVal === current) {
      return send.reply(
        `╭─── « ℹ️ PEHLE SE » ───⟡\n` +
        `│\n` +
        `│ Autosent pehle se ${bold(newVal ? 'ON' : 'OFF')}\n` +
        `│ hai is group mein!\n` +
        `│\n` +
        `╰───────────────⟡`
      );
    }

    await Threads.setSetting(threadID, 'autosent', newVal);

    if (newVal) {
      return send.reply(
        `╭─── « ✅ AUTOSENT ON » ───⟡\n` +
        `│\n` +
        `│ 📢 ${bold('Hourly Messages SHURU!')}\n` +
        `│\n` +
        `│ ◈ Ab ye bot har ghante\n` +
        `│   is group mein ek\n` +
        `│   pyara message or\n` +
        `│   waqt bhi bhayjega!\n` +
        `│\n` +
        `│ 🌙 Zone: ${bold(config.TIMEZONE || 'Asia/Karachi')}\n` +
        `│\n` +
        `│ Band krny k liy:\n` +
        `│ ${bold('.autosent off')}\n` +
        `│\n` +
        `╰───────────────⟡`
      );
    } else {
      return send.reply(
        `╭─── « 🔴 AUTOSENT OFF » ───⟡\n` +
        `│\n` +
        `│ 📴 ${bold('Hourly Messages Band!')}\n` +
        `│\n` +
        `│ Ab is group mein bot\n` +
        `│ hourly msgs nahi\n` +
        `│ bhayjega.\n` +
        `│\n` +
        `│ Dubara on krny k liy:\n` +
        `│ ${bold('.autosent on')}\n` +
        `│\n` +
        `╰───────────────⟡`
      );
    }
  }
};
