const sleep = (ms) => new Promise(r => setTimeout(r, ms));
const spin = ['◐', '◓', '◑', '◒'];

function bold(t) {
  const map = { a:'𝗮',b:'𝗯',c:'𝗰',d:'𝗱',e:'𝗲',f:'𝗳',g:'𝗴',h:'𝗵',i:'𝗶',j:'𝗷',k:'𝗸',l:'𝗹',m:'𝗺',n:'𝗻',o:'𝗼',p:'𝗽',q:'𝗾',r:'𝗿',s:'𝘀',t:'𝘁',u:'𝘂',v:'𝘃',w:'𝘄',x:'𝘅',y:'𝘆',z:'𝘇',A:'𝗔',B:'𝗕',C:'𝗖',D:'𝗗',E:'𝗘',F:'𝗙',G:'𝗚',H:'𝗛',I:'𝗜',J:'𝗝',K:'𝗞',L:'𝗟',M:'𝗠',N:'𝗡',O:'𝗢',P:'𝗣',Q:'𝗤',R:'𝗥',S:'𝗦',T:'𝗧',U:'𝗨',V:'𝗩',W:'𝗪',X:'𝗫',Y:'𝗬',Z:'𝗭',0:'𝟬',1:'𝟭',2:'𝟮',3:'𝟯',4:'𝟰',5:'𝟱',6:'𝟲',7:'𝟳',8:'𝟴',9:'𝟵' };
  return String(t).split('').map(c => map[c] || c).join('');
}

// Fetch all groups bot is currently in
async function fetchAllGroups(api) {
  const groups = [];
  let timestamp = null;
  const BATCH = 100;
  let attempts = 0;

  while (attempts < 10) {
    attempts++;
    try {
      const batch = await new Promise((res, rej) =>
        api.getThreadList(BATCH, timestamp, ['INBOX'], (err, d) => err ? rej(err) : res(d))
      );
      if (!batch || !batch.length) break;
      batch.filter(t => t.isGroup).forEach(t => groups.push({
        threadID: t.threadID,
        name: t.threadName || 'Unnamed Group',
        members: t.participantIDs?.length || 0
      }));
      if (batch.length < BATCH) break;
      timestamp = parseInt(batch[batch.length - 1].timestamp);
    } catch (e) {
      console.log('fetchAllGroups error:', e.message);
      break;
    }
  }
  return groups;
}

async function isBotInGroup(api, threadID, botID) {
  try {
    const info = await new Promise((res, rej) =>
      api.getThreadInfo(threadID, (err, d) => err ? rej(err) : res(d))
    );
    if (!info) return false;
    if (!info.isGroup) return false;
    const participants = info.participantIDs || [];
    return participants.includes(botID);
  } catch {
    return false;
  }
}

module.exports = {
  config: {
    credits: 'MR DEVIL',
    name: 'outbox',
    aliases: ['leavegroups', 'groupleave', 'leftgroups'],
    description: 'Group list dekho aur selected groups se bot leave kare.',
    usage: 'outbox  |  outbox 1,3,5',
    category: 'Admin',
    prefix: true,
    adminOnly: false,
    cooldowns: 10
  },

  async run({ api, event, send, args, config, isAdmin }) {
    const { threadID, senderID } = event;

    if (!isAdmin) {
      return api.sendMessage(
        `╭─── « ❌ ACCESS DENIED » ───⟡\n` +
        `│\n` +
        `│ 🚫 Sirf Bot Admin use\n` +
        `│    kar sakta hai!\n` +
        `│\n` +
        `╰───────────────⟡`,
        threadID
      );
    }

// ── STEP 1: No args → show numbered group list ──────────────────
    if (!args[0]) {
      let info;
      try {
        info = await new Promise((resolve, reject) => {
          api.sendMessage(
            `╭─── « ⏳ LOADING » ───⟡\n` +
            `│\n` +
            `│ ${spin[0]} Groups la raha hoon...\n` +
            `│ Thoda wait karo...\n` +
            `│\n` +
            `╰───────────────⟡`,
            threadID,
            (err, data) => err ? reject(err) : resolve(data)
          );
        });
      } catch (e) {
        console.log('send.reply error:', e.message);
        return api.sendMessage(`❌ Error: ${e.message}`, threadID);
      }
      const mid = info?.messageID;
      const edit = (txt) => { try { api.editMessage(txt, mid); } catch {} };

      let groups;
      try {
        groups = await fetchAllGroups(api);
      } catch (e) {
        return edit(
          `╭─── « ❌ ERROR » ───⟡\n` +
          `│\n` +
          `│ 😔 Groups nahi mili.\n` +
          `│ ◈ ${e.message || 'Unknown error'}\n` +
          `│\n` +
          `╰───────────────⟡`
        );
      }

      // Filter: Only show groups where bot is actually a member
      const botID = api.getCurrentUserID();
      edit(`╭─── « ⏳ VERIFYING » ───⟡\n│\n│ Checking bot membership...\n│\n╰───────────────⟡`);
      
      const activeGroups = [];
      for (let i = 0; i < groups.length; i++) {
        const isIn = await isBotInGroup(api, groups[i].threadID, botID);
        if (isIn) activeGroups.push(groups[i]);
        if (i % 10 === 0 || i === groups.length - 1) {
          edit(`╭─── « ⏳ VERIFYING » ───⟡\n│\n│ ${i + 1}/${groups.length} checked\n│ Active: ${activeGroups.length}\n│\n╰───────────────⟡`);
        }
        await sleep(150);
      }
      groups = activeGroups;

      if (!groups.length) {
        return edit(
          `╭─── « 📭 KHAALI » ───⟡\n` +
          `│\n` +
          `│ 😕 Bot kisi group mein\n` +
          `│    nahi hai abhi.\n` +
          `│\n` +
          `╰───────────────⟡`
        );
      }

      // Build paginated list (max 30 per message to avoid length limit)
      const PAGE = 30;
      const total = groups.length;
      const pages = Math.ceil(total / PAGE);

      for (let p = 0; p < pages; p++) {
        const slice = groups.slice(p * PAGE, (p + 1) * PAGE);
        const startIdx = p * PAGE + 1;

        const lines = slice.map((g, i) => {
          const num = startIdx + i;
          const name = g.name.length > 28 ? g.name.substring(0, 26) + '..' : g.name;
          return `│ ${bold(String(num).padStart(2, ' '))}. ${name}`;
        }).join('\n');

        const header = p === 0
          ? `╭─── « 📋 GROUP LIST » ───⟡\n│\n│ 📊 Total Groups: ${bold(String(total))}\n│\n`
          : `╭─── « 📋 GROUP LIST » ───⟡\n│ (Page ${p + 1}/${pages})\n│\n`;

        const footer = `│\n│ 💡 ${bold('Leave karne ke liye:')}\n│    ${bold('.outbox 1,3,5')}\n│    (numbers comma se alag karo)\n│\n╰───────────────⟡`;

        if (p === 0) {
          edit(header + lines + '\n' + footer);
        } else {
          await sleep(800);
          await api.sendMessage(header + lines + '\n' + footer, threadID);
        }
      }

      return;
    }

    // ── STEP 2: Args given → parse numbers and leave those groups ───
    const rawNums = args.join('').split(',').map(n => parseInt(n.trim())).filter(n => !isNaN(n) && n > 0);

    if (!rawNums.length) {
      return api.sendMessage(
        `╭─── « ❓ GALAT FORMAT » ───⟡\n` +
        `│\n` +
        `│ 💡 Sahi tarika:\n` +
        `│    ${bold('.outbox 1,3,5')}\n` +
        `│    ${bold('.outbox 2,8,10,15')}\n` +
        `│\n` +
        `│ Pehle ${bold('.outbox')} likh ke\n` +
        `│ list dekho, phir numbers\n` +
        `│ choose karo.\n` +
        `│\n` +
        `╰───────────────⟡`,
        threadID
      );
    }

    const info = await new Promise((resolve, reject) => {
      api.sendMessage(
        `╭─── « 🚪 OUTBOX » ───⟡\n` +
        `│\n` +
        `│ ${spin[0]} Groups la raha hoon...\n` +
        `│ Selected: ${bold(rawNums.join(', '))}\n` +
        `│\n` +
        `╰───────────────⟡`,
        threadID,
        (err, data) => err ? reject(err) : resolve(data)
      );
    });
    const mid = info?.messageID;
    const edit = (txt) => { try { api.editMessage(txt, mid); } catch {} };

    let groups;
    try {
      groups = await fetchAllGroups(api);
    } catch (e) {
      return edit(
        `╭─── « ❌ ERROR » ───⟡\n` +
        `│\n` +
        `│ 😔 Groups nahi mili.\n` +
        `│ ◈ ${e.message || 'Unknown'}\n` +
        `│\n` +
        `╰───────────────⟡`
      );
    }

    // Filter: Only keep groups where bot is a member
    const botID = api.getCurrentUserID();
    const activeGroups = [];
    for (const g of groups) {
      const isIn = await isBotInGroup(api, g.threadID, botID);
      if (isIn) activeGroups.push(g);
    }
    groups = activeGroups;

    // Filter valid selected groups
    const selected = rawNums
      .filter(n => n >= 1 && n <= groups.length)
      .map(n => groups[n - 1]);

    const unique = [...new Map(selected.map(g => [g.threadID, g])).values()];

    if (!unique.length) {
      return edit(
        `╭─── « ❌ INVALID » ───⟡\n` +
        `│\n` +
        `│ 😕 Yeh numbers valid\n` +
        `│    nahi hain!\n` +
        `│\n` +
        `│ Groups total: ${bold(String(groups.length))}\n` +
        `│ 1 se ${bold(String(groups.length))} tak choose karo.\n` +
        `│\n` +
        `╰───────────────⟡`
      );
    }

    // Confirm leaving message
    const listPreview = unique.map((g, i) => `│ ◈ ${i + 1}. ${g.name.length > 25 ? g.name.substring(0, 23) + '..' : g.name}`).join('\n');
    edit(
      `╭─── « 🚪 LEAVING » ───⟡\n` +
      `│\n` +
      `│ 📤 In groups se leave\n` +
      `│    ho raha hoon:\n` +
      `│\n` +
      `${listPreview}\n` +
      `│\n` +
      `│ ${spin[0]} Shuru ho raha hai...\n` +
      `│\n` +
      `╰───────────────⟡`
    );

    await sleep(1000);

    let left = 0;
    let failed = 0;
    let sf = 0;

    const FAREWELL =
      `╭─── « 👋 ALVIDA » ───⟡\n` +
      `│\n` +
      `│ 🌟 Assalamu Alaikum!\n` +
      `│\n` +
      `│ 📢 ${bold('Owner ka hukam hy')},\n` +
      `│    Main is group se\n` +
      `│    leave kar rhi hoon.\n` +
      `│\n` +
      `│ 🤝 Aap sab ka shukriya!\n` +
      `│ 💎 — MR DEVIL BOT\n` +
      `│\n` +
      `╰───────────────⟡`;

    for (const g of unique) {
      sf++;
      const shortName = g.name.length > 22 ? g.name.substring(0, 20) + '..' : g.name;

      // Send farewell message to that group first
      try {
        await new Promise((res, rej) =>
          api.sendMessage(FAREWELL, g.threadID, (err) => err ? rej(err) : res())
        );
        await sleep(600);
      } catch {}

      // Now leave — use leaveThread (self-leave) not removeUserFromGroup (removes others)
      let didLeave = false;
      try {
        await new Promise((res, rej) =>
          api.leaveThread(g.threadID, (err) => err ? rej(err) : res())
        );
        left++;
        didLeave = true;
      } catch {
        failed++;
      }

      // Confirmation message back in the original chat
      try {
        const confirmMsg = didLeave
          ? `╭─── « ✅ LEFT HO GYA » ───⟡\n` +
            `│\n` +
            `│ 📤 ${bold(String(left))}/${bold(String(unique.length))} Left!\n` +
            `│\n` +
            `│ 👋 Group:\n` +
            `│    ${shortName}\n` +
            `│\n` +
            `│ ✅ Left ho gaya!\n` +
            `│ 👋 Alvida msg bhi gaya!\n` +
            `│\n` +
            `╰───────────────⟡`
          : `╭─── « ❌ LEFT NAHI HUA » ───⟡\n` +
            `│\n` +
            `│ ⚠️ Group:\n` +
            `│    ${shortName}\n` +
            `│\n` +
            `│ ❌ Leave nahi hua!\n` +
            `│    (Shayad pehle se left\n` +
            `│     ya permission nahi)\n` +
            `│\n` +
            `╰───────────────⟡`;
        api.sendMessage(confirmMsg, threadID, () => {});
      } catch {}

      edit(
        `╭─── « 🚪 LEAVING » ───⟡\n` +
        `│\n` +
        `│ ${spin[sf % 4]} Leave ho raha hai...\n` +
        `│\n` +
        `│ 📤 ${left + failed}/${unique.length} process kiye\n` +
        `│ ✅ Left   : ${bold(String(left))}\n` +
        `│ ❌ Failed : ${bold(String(failed))}\n` +
        `│\n` +
        `│ 🔄 Last: ${shortName}\n` +
        `│\n` +
        `╰───────────────⟡`
      );

      await sleep(800);
    }

    await sleep(500);

    // Final report in the original group (where command was sent)
    const doneLines = unique.map((g, i) => `│ ◈ ${g.name.length > 24 ? g.name.substring(0, 22) + '..' : g.name}`).join('\n');

    edit(
      `╭─── « ✅ OUTBOX DONE » ───⟡\n` +
      `│\n` +
      `│ 🏁 ${bold('Kaam Mukammal!')}\n` +
      `│\n` +
      `${doneLines}\n` +
      `│\n` +
      `│ ◈ ✅ Left   : ${bold(String(left))}\n` +
      `│ ◈ ❌ Failed : ${bold(String(failed))}\n` +
      `│ ◈ 📊 Total  : ${bold(String(unique.length))}\n` +
      `│\n` +
      `│ 👋 Alvida message bhi\n` +
      `│    bhaej diya gaya!\n` +
      `│\n` +
      `╰───────────────⟡`
    );
  }
};
