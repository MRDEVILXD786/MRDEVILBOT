const sleep = (ms) => new Promise(r => setTimeout(r, ms));
const spin = ['◐', '◓', '◑', '◒'];

function bar(done, total, size = 10) {
  const f = Math.round((done / Math.max(total, 1)) * size);
  return '█'.repeat(f) + '░'.repeat(size - f);
}

function pct(done, total) {
  return Math.round((done / Math.max(total, 1)) * 100);
}

function bold(t) {
  const map = { a:'𝗮',b:'𝗯',c:'𝗰',d:'𝗱',e:'𝗲',f:'𝗳',g:'𝗴',h:'𝗵',i:'𝗶',j:'𝗷',k:'𝗸',l:'𝗹',m:'𝗺',n:'𝗻',o:'𝗼',p:'𝗽',q:'𝗾',r:'𝗿',s:'𝘀',t:'𝘁',u:'𝘂',v:'𝘃',w:'𝘄',x:'𝘅',y:'𝘆',z:'𝘇',A:'𝗔',B:'𝗕',C:'𝗖',D:'𝗗',E:'𝗘',F:'𝗙',G:'𝗚',H:'𝗛',I:'𝗜',J:'𝗝',K:'𝗞',L:'𝗟',M:'𝗠',N:'𝗡',O:'𝗢',P:'𝗣',Q:'𝗤',R:'𝗥',S:'𝗦',T:'𝗧',U:'𝗨',V:'𝗩',W:'𝗪',X:'𝗫',Y:'𝗬',Z:'𝗭',0:'𝟬',1:'𝟭',2:'𝟮',3:'𝟯',4:'𝟰',5:'𝟱',6:'𝟲',7:'𝟳',8:'𝟴',9:'𝟵' };
  return String(t).split('').map(c => map[c] || c).join('');
}

module.exports = {
  config: {
    credits: 'MR DEVIL',
    name: 'clearnickall',
    aliases: ['clearnicks', 'resetnickall', 'removenickall'],
    description: 'Group ke tamam members ka nickname clear karo.',
    usage: 'clearnickall',
    category: 'Group',
    prefix: true,
    groupOnly: true,
    adminOnly: true,
    cooldowns: 10
  },

  async run({ api, event, send, config, isAdmin }) {
    const { threadID, senderID } = event;

    if (!isAdmin) {
      return send.reply(
        `╭─── « ❌ ACCESS DENIED » ───⟡\n` +
        `│\n` +
        `│ 🚫 Yeh command sirf Bot\n` +
        `│    Admin use kar sakta hai!\n` +
        `│\n` +
        `╰───────────────⟡`
      );
    }

    let threadInfo;
    try {
      threadInfo = await new Promise((res, rej) =>
        api.getThreadInfo(threadID, (err, info) => err ? rej(err) : res(info))
      );
    } catch (e) {
      return send.reply(
        `╭─── « ❌ ERROR » ───⟡\n` +
        `│\n` +
        `│ 😔 Group info nahi mili.\n` +
        `│ ◈ ${e.message || 'Unknown'}\n` +
        `│\n` +
        `╰───────────────⟡`
      );
    }

    const botID = api.getCurrentUserID();
    const members = (threadInfo.participantIDs || []).filter(id => id !== botID);

    if (!members.length) {
      return send.reply(
        `╭─── « ❌ KHAALI » ───⟡\n` +
        `│\n` +
        `│ 😕 Koi member nahi mila.\n` +
        `│\n` +
        `╰───────────────⟡`
      );
    }

    const info = await send.reply(
      `╭─── « 🏷️ CLEAR NICKS » ───⟡\n` +
      `│\n` +
      `│ ${spin[0]} Shuru ho raha hai...\n` +
      `│ 👥 Total: ${bold(String(members.length))}\n` +
      `│\n` +
      `│ [░░░░░░░░░░] 0%\n` +
      `│\n` +
      `╰───────────────⟡`
    );

    const mid = info?.messageID;
    const edit = (txt) => { try { api.editMessage(txt, mid); } catch {} };

    let done = 0;
    let success = 0;
    let failed = 0;
    let sf = 0;

    for (const uid of members) {
      try {
        await new Promise((res, rej) =>
          api.changeNickname('', threadID, uid, (err) => err ? rej(err) : res())
        );
        success++;
      } catch {
        failed++;
      }

      done++;
      sf++;

      const p = pct(done, members.length);
      const b = bar(done, members.length);

      edit(
        `╭─── « 🏷️ CLEAR NICKS » ───⟡\n` +
        `│\n` +
        `│ ${spin[sf % 4]} Clearing...\n` +
        `│ 👥 ${done}/${members.length} members\n` +
        `│\n` +
        `│ [${b}] ${p}%\n` +
        `│ ✅ ${success}  ❌ ${failed}\n` +
        `│\n` +
        `╰───────────────⟡`
      );

      await sleep(150);
    }

    await sleep(500);

    edit(
      `╭─── « ✅ COMPLETE » ───⟡\n` +
      `│\n` +
      `│ 🏷️ ${bold('Clear Nick Mukammal!')}\n` +
      `│\n` +
      `│ ◈ 👥 Total   : ${bold(String(members.length))}\n` +
      `│ ◈ ✅ Cleared : ${bold(String(success))}\n` +
      `│ ◈ ❌ Failed  : ${bold(String(failed))}\n` +
      `│\n` +
      `│ 📝 Sab nicknames saaf\n` +
      `│    ho gaye! ✨\n` +
      `│\n` +
      `╰───────────────⟡`
    );
  }
};
