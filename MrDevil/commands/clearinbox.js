const spin = ['◐', '◓', '◑', '◒'];
const frames = ['⬜⬜⬜⬜⬜', '🟦⬜⬜⬜⬜', '🟦🟦⬜⬜⬜', '🟦🟦🟦⬜⬜', '🟦🟦🟦🟦⬜', '🟦🟦🟦🟦🟦'];

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

function pct(done, total) {
  return Math.round((done / Math.max(total, 1)) * 100);
}

function barStr(done, total, size = 12) {
  const f = Math.round((done / Math.max(total, 1)) * size);
  return '█'.repeat(f) + '░'.repeat(size - f);
}

// Fetch ALL group threads from Facebook (including archived)
async function fetchAllGroupThreads(api) {
  const groups = [];
  let timestamp = null;
  const BATCH = 100;

  // First get inbox groups
  while (true) {
    let batch;
    try {
      batch = await new Promise((res, rej) =>
        api.getThreadList(BATCH, timestamp, ['INBOX'], (err, d) => err ? rej(err) : res(d))
      );
    } catch { break; }

    if (!batch || !batch.length) break;

    const filtered = batch.filter(t => t.isGroup);
    groups.push(...filtered);

    if (batch.length < BATCH) break;
    timestamp = parseInt(batch[batch.length - 1].timestamp);
  }

  // Then get archived groups (SPAM, ARCHIVE, other folders)
  const folderTags = ['SPAM', 'ARCHIVE', 'GROUP', 'INBOX', 'FOLDER'];
  
  for (const tag of folderTags) {
    if (tag === 'INBOX') continue; // already fetched
    timestamp = null;
    try {
      while (true) {
        const batch = await new Promise((res, rej) =>
          api.getThreadList(BATCH, timestamp, [tag], (err, d) => err ? rej(err) : res(d))
        );
        if (!batch || !batch.length) break;
        
        const filtered = batch.filter(t => t.isGroup);
        for (const g of filtered) {
          // Avoid duplicates
          if (!groups.some(existing => existing.threadID === g.threadID)) {
            groups.push(g);
          }
        }
        
        if (batch.length < BATCH) break;
        timestamp = parseInt(batch[batch.length - 1].timestamp);
      }
    } catch { continue; }
  }

  return groups;
}

// Check if bot is in group
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
    name: 'clearinbox',
    aliases: ['cleaninbox', 'purgeinbox', 'cleanup'],
    description: 'Bot jahan nahi hai un groups ko DB se delete karo aur archived/spam groups clear karo.',
    usage: 'clearinbox',
    category: 'Admin',
    prefix: true,
    adminOnly: true
  },

  async run({ api, event, send, Threads }) {
    const { threadID } = event;

    const info = await new Promise((resolve, reject) => {
      api.sendMessage(
        `╭─────────────────────────╮\n` +
        `│  🧹 CLEAR INBOX          │\n` +
        `│  ${spin[0]} Fetching all groups...\n` +
        `╰─────────────────────────╯`,
        threadID,
        (err, data) => err ? reject(err) : resolve(data)
      );
    });
    const mid = info?.messageID;
    const edit = (txt) => { try { api.editMessage(txt, mid); } catch {} };

    // Animate
    let sf = 0;
    const anim = setInterval(() => {
      edit(
        `╭─────────────────────────╮\n` +
        `│  🧹 CLEAR INBOX          │\n` +
        `│  ${spin[sf % 4]} Scanning groups...\n` +
        `│  ${frames[Math.min(sf, 5)]}\n` +
        `╰─────────────────────────╯`
      );
      sf++;
    }, 500);

    // Fetch all groups from all folders
    let fbGroups = [];
    try {
      fbGroups = await fetchAllGroupThreads(api);
    } catch (e) {
      clearInterval(anim);
      return edit('❌ Error fetching groups: ' + e.message);
    }
    clearInterval(anim);

    const totalScanned = fbGroups.length;
    edit(
      `╭─────────────────────────╮\n` +
      `│  🧹 SCANNING...          │\n` +
      `│  📊 Total found: ${totalScanned}\n` +
      `│  🔍 Verifying membership...\n` +
      `╰─────────────────────────╯`
    );

    // Get bot ID and verify membership
    const botID = api.getCurrentUserID();
    const activeGroups = [];
    const inactiveGroups = [];

    for (let i = 0; i < fbGroups.length; i++) {
      const g = fbGroups[i];
      const isIn = await isBotInGroup(api, g.threadID, botID);
      
      if (isIn) {
        activeGroups.push(g);
      } else {
        inactiveGroups.push(g);
      }

      if (i % 10 === 0 || i === fbGroups.length - 1) {
        edit(
          `╭─────────────────────────╮\n` +
          `│  🧹 VERIFYING...         │\n` +
          `│  ${i + 1}/${totalScanned} checked\n` +
          `│  ✅ Active: ${activeGroups.length}\n` +
          `│  ❌ Left: ${inactiveGroups.length}\n` +
          `│  [${barStr(i + 1, totalScanned)}] ${pct(i + 1, totalScanned)}%\n` +
          `╰─────────────────────────╯`
        );
      }
      await sleep(150);
    }

    // Get DB threads
    let dbGroups = [];
    try {
      dbGroups = await Threads.getAll();
    } catch {}

    const dbIDs = new Set(dbGroups.map(t => t.id));
    const fbIDs = new Set(activeGroups.map(g => g.threadID));

    // Find groups in DB that are NOT in FB active list
    const toDelete = dbGroups.filter(t => !fbIDs.has(t.id));
    const toKeep = dbGroups.filter(t => fbIDs.has(t.id));

    edit(
      `╭─────────────────────────╮\n` +
      `│  🧹 DELETING...          │\n` +
      `│  📦 DB Total: ${dbGroups.length}\n` +
      `│  ❌ To Delete: ${toDelete.length}\n` +
      `│  ✅ To Keep: ${toKeep.length}\n` +
      `╰─────────────────────────╯`
    );

    // Delete inactive groups from DB
    let deleted = 0;
    for (const t of toDelete) {
      try {
        await Threads.delete(t.id);
        deleted++;
      } catch {}
    }

    // Final result
    const lines = [
      `╭──── 🧹 CLEAR INBOX DONE ────╮`,
      `│`,
      `│  📊 Groups Scanned  : ${totalScanned}`,
      `│  ✅ Bot is Active  : ${activeGroups.length}`,
      `│  ❌ Bot Left       : ${inactiveGroups.length}`,
      `│  🗑️ Deleted from DB: ${deleted}`,
      `│  💾 DB Cleaned     : ${toKeep.length} kept`,
      `│`,
      `│  ✅ Inbox cleaned!`,
      `│  🧹 All left groups removed`,
      `╰──────────────────────────────╯`
    ];

    if (toDelete.length > 0) {
      lines.splice(6, 0, `│  📛 Removed Groups:`);
      toDelete.slice(0, 8).forEach((t, i) => {
        lines.splice(7 + i, 0, `│   ${i + 1}. ${t.name || t.id}`);
      });
      if (toDelete.length > 8) {
        lines.splice(15, 0, `│   ...+${toDelete.length - 8} more`);
      }
    }

    await api.sendMessage(lines.join('\n'), threadID);
  }
};