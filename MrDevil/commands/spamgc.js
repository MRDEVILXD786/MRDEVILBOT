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
    credits: "MR DEVIL",
    name: 'spamgc',
    aliases: ['spamgroups', 'spamlist', 'pending'],
    description: 'Spam/pending groups ki list dekho aur unhe connect karo.',
    usage: 'spamgc',
    category: 'Admin',
    prefix: true,
    adminOnly: true
  },

  async run({ api, event, send, client, config }) {
    const { threadID, senderID } = event;

    const info = await send.reply(
      `╭─── « 🔍 SPAM SCAN » ───⟡\n` +
      `│\n` +
      `│ ${spin[0]} Scanning inbox...\n` +
      `│ 📡 Facebook se data la\n` +
      `│    raha hun...\n` +
      `│\n` +
      `╰───────────────⟡`
    );

    const mid = info?.messageID;
    const edit = (txt) => { try { api.editMessage(txt, mid); } catch {} };

    try {
      await sleep(600);
      edit(
        `╭─── « 🔍 SPAM SCAN » ───⟡\n` +
        `│\n` +
        `│ ${spin[1]} Pending check ho raha...\n` +
        `│ 📬 PENDING folder...\n` +
        `│\n` +
        `╰───────────────⟡`
      );

      const pendingThreads = await api.getThreadList(100, null, ['PENDING']);

      await sleep(400);
      edit(
        `╭─── « 🔍 SPAM SCAN » ───⟡\n` +
        `│\n` +
        `│ ${spin[2]} Other check ho raha...\n` +
        `│ 📂 OTHER folder...\n` +
        `│\n` +
        `╰───────────────⟡`
      );

      const otherThreads = await api.getThreadList(100, null, ['OTHER']);

      const allSpam = [...pendingThreads, ...otherThreads].filter(t => t.isGroup);

      await sleep(400);

      if (!allSpam.length) {
        return edit(
          `╭─── « ✅ ALL CLEAR » ───⟡\n` +
          `│\n` +
          `│ 🎉 Koi spam/pending\n` +
          `│    group nahi mila!\n` +
          `│\n` +
          `│ 📬 Inbox bilkul saaf hai\n` +
          `│\n` +
          `╰───────────────⟡`
        );
      }

      const showCount = Math.min(allSpam.length, 20);
      const spamList = [];
      let listLines = '';

      for (let i = 0; i < showCount; i++) {
        const g = allSpam[i];
        const name = g.name || g.threadName || 'Unknown Group';
        const members = g.participantIDs?.length || '?';
        spamList.push({ index: i + 1, id: g.threadID, name });
        listLines +=
          `│\n` +
          `│ ${bold(String(i + 1))}. ${name.length > 18 ? name.slice(0, 16) + '..' : name}\n` +
          `│    🆔 ${g.threadID}\n` +
          `│    👥 ${members} members\n`;
      }

      let extra = '';
      if (allSpam.length > 20) {
        extra = `│\n│ ➕ Aur ${allSpam.length - 20} mazeed groups\n`;
      }

      edit(
        `╭─── « 📋 SPAM GROUPS » ───⟡\n` +
        `│ 🔢 Total: ${bold(String(allSpam.length))} groups\n` +
        `│─────────────────────────\n` +
        listLines +
        extra +
        `│\n` +
        `│─────────────────────────\n` +
        `│ 📌 Number reply karo\n` +
        `│    accept karne ke liye\n` +
        `│ 📌 "all" = sab accept\n` +
        `│ 📌 "1,3,5" = multiple\n` +
        `│\n` +
        `╰───────────────⟡`
      );

      if (client.replies && mid) {
        client.replies.set(mid, {
          commandName: 'spamgc',
          author: senderID,
          data: { spamList }
        });
      }

    } catch (e) {
      edit(
        `╭─── « ❌ ERROR » ───⟡\n` +
        `│\n` +
        `│ 😔 Kuch galat ho gaya\n` +
        `│ ◈ ${e.message?.slice(0, 40) || 'Unknown error'}\n` +
        `│\n` +
        `╰───────────────⟡`
      );
    }
  },

  async handleReply({ api, event, send, client, data, config }) {
    const { body, senderID, threadID } = event;
    const { spamList } = data;

    if (!body) return;

    const originalAuthor = data?.author;
    const isOwner = require('../../controller/utility/core');
    const isAdmin = config?.ADMINBOT?.includes(String(senderID)) || isOwner(senderID);

    if (originalAuthor && senderID !== originalAuthor && !isAdmin) {
      return send.reply(
        `╭─── « ❌ ACCESS » ───⟡\n` +
        `│\n` +
        `│ 🚫 Sirf command user\n` +
        `│    ya admin reply kar\n` +
        `│    sakta hai!\n` +
        `│\n` +
        `╰───────────────⟡`
      );
    }

    if (!spamList || spamList.length === 0) {
      return send.reply(
        `╭─── « ❌ EXPIRED » ───⟡\n` +
        `│\n` +
        `│ ⏰ Data expire ho gaya\n` +
        `│ 🔄 Phir se .spamgc\n` +
        `│    run karo\n` +
        `│\n` +
        `╰───────────────⟡`
      );
    }

    const input = body.trim().toLowerCase();
    let toAccept = [];

    if (input === 'all') {
      toAccept = spamList;
    } else if (input.includes(',')) {
      const nums = input.split(',').map(n => parseInt(n.trim())).filter(n => !isNaN(n));
      for (const num of nums) {
        const item = spamList.find(p => p.index === num);
        if (item) toAccept.push(item);
      }
    } else {
      const num = parseInt(input);
      if (!isNaN(num)) {
        const item = spamList.find(p => p.index === num);
        if (item) toAccept.push(item);
      }
    }

    if (toAccept.length === 0) {
      return send.reply(
        `╭─── « ❌ INVALID » ───⟡\n` +
        `│\n` +
        `│ ⚠️ Sahi number choose\n` +
        `│    karo list mein se\n` +
        `│\n` +
        `╰───────────────⟡`
      );
    }

    const info2 = await send.reply(
      `╭─── « 🔗 CONNECTING » ───⟡\n` +
      `│\n` +
      `│ ${spin[0]} Shuru ho raha hai...\n` +
      `│ 📊 Total: ${bold(String(toAccept.length))} groups\n` +
      `│\n` +
      `│ [░░░░░░░░░░] 0%\n` +
      `│\n` +
      `╰───────────────⟡`
    );

    const mid2 = info2?.messageID;
    const edit2 = (txt) => { try { api.editMessage(txt, mid2); } catch {} };

    let accepted = 0;
    let failed = 0;
    let sf = 0;

    for (let i = 0; i < toAccept.length; i++) {
      const item = toAccept[i];
      sf++;

      edit2(
        `╭─── « 🔗 CONNECTING » ───⟡\n` +
        `│\n` +
        `│ ${spin[sf % 4]} Accept ho raha...\n` +
        `│ 📌 ${item.name.length > 18 ? item.name.slice(0, 16) + '..' : item.name}\n` +
        `│\n` +
        `│ [${bar(i, toAccept.length)}] ${pct(i, toAccept.length)}%\n` +
        `│ ✅ ${accepted}  ❌ ${failed}\n` +
        `│\n` +
        `╰───────────────⟡`
      );

      try {
        await new Promise((resolve, reject) => {
          api.handleMessageRequest(item.id, true, (err) => err ? reject(err) : resolve());
        });

        await sleep(800);

        try {
          const botnick = config.BOTNICK || `{ ${config.PREFIX} } × ${config.BOTNAME || 'bot'}`;
          await api.sendMessage(`✅ MR DEVIL BOT CONNECTED`, item.id);
          try { await api.changeNickname(botnick, item.id, api.getCurrentUserID()); } catch {}
        } catch {}

        accepted++;
      } catch {
        failed++;
      }

      sf++;
      edit2(
        `╭─── « 🔗 CONNECTING » ───⟡\n` +
        `│\n` +
        `│ ${spin[sf % 4]} Processing...\n` +
        `│ ✅ ${item.name.length > 18 ? item.name.slice(0, 16) + '..' : item.name}\n` +
        `│\n` +
        `│ [${bar(i + 1, toAccept.length)}] ${pct(i + 1, toAccept.length)}%\n` +
        `│ ✅ ${accepted}  ❌ ${failed}\n` +
        `│\n` +
        `╰───────────────⟡`
      );

      await sleep(400);
    }

    await sleep(500);

    edit2(
      `╭─── « ✅ MUKAMMAL » ───⟡\n` +
      `│\n` +
      `│ 🎉 ${bold('Sab ho gaya!')}\n` +
      `│\n` +
      `│ ◈ 📊 Total  : ${bold(String(toAccept.length))}\n` +
      `│ ◈ ✅ Accept : ${bold(String(accepted))}\n` +
      `│ ◈ ❌ Failed : ${bold(String(failed))}\n` +
      `│\n` +
      `│ 🔗 Bot connect ho gaya\n` +
      `│    un groups mein! 🚀\n` +
      `│\n` +
      `╰───────────────⟡`
    );
  }
};
