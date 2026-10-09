function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

// Fetch from ALL folders and filter only active groups
async function fetchAllGroupThreads(api) {
  const groups = [];
  const seenIDs = new Set();
  const BATCH = 100;
  
  // Get groups from all folders
  const folders = ['INBOX', 'PENDING', 'SPAM', 'OTHER'];
  
  for (const folder of folders) {
    let timestamp = null;
    while (true) {
      let batch;
      try {
        batch = await new Promise((res, rej) =>
          api.getThreadList(BATCH, timestamp, [folder], (err, d) => err ? rej(err) : res(d))
        );
      } catch { break; }

      if (!batch || !batch.length) break;

      const filtered = batch.filter(t => t.isGroup);
      for (const g of filtered) {
        if (!seenIDs.has(g.threadID)) {
          seenIDs.add(g.threadID);
          groups.push(g);
        }
      }

      if (batch.length < BATCH) break;
      timestamp = parseInt(batch[batch.length - 1].timestamp);
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
    credits: "MR DEVIL",
    name: 'allbox',
    aliases: ['allgroups', 'grouplist'],
    description: 'Bot jin jin groups mein hai unki puri list show karo.',
    usage: 'allbox',
    category: 'Admin',
    prefix: true,
    adminOnly: true
  },

  async run({ api, event, send, Threads }) {
    const { threadID } = event;
    const info = await new Promise((resolve, reject) => {
      api.sendMessage('⏳ Facebook se sab groups la raha hun...', threadID, (err, d) => err ? reject(err) : resolve(d));
    });
    const mid = info?.messageID;
    const edit = (txt) => { try { api.editMessage(txt, mid); } catch {} };

    let fbGroups = [];
    try { fbGroups = await fetchAllGroupThreads(api); } catch (e) {
      return edit('❌ Groups fetch nahi ho sake: ' + e.message);
    }

    if (!fbGroups.length) {
      return edit('❌ Koi group nahi mila.');
    }

    // Filter: Verify bot is actually in each group
    const botID = api.getCurrentUserID();
    edit(`⏳ Checking bot membership in ${fbGroups.length} groups...`);
    
    const activeGroups = [];
    for (let i = 0; i < fbGroups.length; i++) {
      const g = fbGroups[i];
      const isIn = await isBotInGroup(api, g.threadID, botID);
      if (isIn) {
        activeGroups.push(g);
      }
      if (i % 10 === 0 || i === fbGroups.length - 1) {
        edit(`⏳ Verifying: ${i + 1}/${fbGroups.length} groups...\n✅ Active: ${activeGroups.length}`);
      }
      await sleep(200);
    }

    fbGroups = activeGroups;

    if (!fbGroups.length) {
      return edit('❌ Bot kisi group mein nahi hai.');
    }

    // Get DB info for spam/banned status
    let dbMap = {};
    try {
      const all = await Threads.getAll();
      all.forEach(t => { dbMap[t.id] = t; });
    } catch {}

    const lines = [];
    fbGroups.forEach((g, i) => {
      const db = dbMap[g.threadID];
      const status = db?.banned ? '🚫' : db?.settings?.spam ? '⚠️' : '✅';
      const members = g.participantIDs?.length || '?';
      lines.push(`${i + 1}. ${status} ${g.threadName || 'Unnamed'}\n    🆔 ${g.threadID} | 👥 ${members}`);
    });

    // Split into chunks of 30 groups per message to avoid length limit
    const CHUNK = 30;
    for (let i = 0; i < lines.length; i += CHUNK) {
      const chunk = lines.slice(i, i + CHUNK);
      const isFirst = i === 0;
      const header = isFirst
        ? `╭──── 📋 ALL GROUPS (${fbGroups.length}) ────╮\n│ ✅ Active  ⚠️ Spam  🚫 Banned\n╰──────────────────────────────╯\n\n`
        : `📋 Groups ${i + 1}–${Math.min(i + CHUNK, fbGroups.length)}:\n\n`;

      const msg = header + chunk.join('\n\n');

      if (isFirst) {
        edit(msg);
      } else {
        await sleep(500);
        await api.sendMessage(msg, threadID);
      }
    }
  }
};
