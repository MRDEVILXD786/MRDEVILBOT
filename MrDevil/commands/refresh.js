const frames = ['⬜⬜⬜⬜⬜', '🟦⬜⬜⬜⬜', '🟦🟦⬜⬜⬜', '🟦🟦🟦⬜⬜', '🟦🟦🟦🟦⬜', '🟦🟦🟦🟦🟦'];
const spin   = ['◐', '◓', '◑', '◒'];

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

function pct(done, total) {
  return Math.round((done / Math.max(total, 1)) * 100);
}

function barStr(done, total, size = 12) {
  const f = Math.round((done / Math.max(total, 1)) * size);
  return '█'.repeat(f) + '░'.repeat(size - f);
}

// Fetch ALL group threads from Facebook (paginated)
async function fetchAllGroupThreads(api) {
  const groups = [];
  let timestamp = null;
  const BATCH = 100;

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

  return groups;
}

module.exports = {
  config: {
    credits: "MR DEVIL",
    name: 'refresh',
    aliases: ['rinbox', 'refreshbox'],
    description: 'Facebook se sab groups fetch karo, DB update karo, inbox refresh karo.',
    usage: 'refresh',
    category: 'Admin',
    prefix: true,
    adminOnly: true
  },

  async run({ api, event, send, Threads }) {
    const { threadID } = event;
    // ── Phase 1: Start ──
    const info = await new Promise((resolve, reject) => {
      api.sendMessage(
        `╭─────────────────────────╮\n` +
        `│  ♻️  INBOX REFRESH        │\n` +
        `│  ${spin[0]} Facebook se la raha hun...\n` +
        `╰─────────────────────────╯`,
        threadID,
        (err, data) => err ? reject(err) : resolve(data)
      );
    });
    const mid = info?.messageID;
    const edit = (txt) => { try { api.editMessage(txt, mid); } catch {} };

    // Animate while fetching
    let sf = 0;
    const anim = setInterval(() => {
      edit(
        `╭─────────────────────────╮\n` +
        `│  ♻️  INBOX REFRESH        │\n` +
        `│  ${spin[sf % 4]} Facebook se la raha hun...\n` +
        `│  ${frames[Math.min(sf, 5)]}\n` +
        `╰─────────────────────────╯`
      );
      sf++;
    }, 500);

    // ── Phase 2: Fetch ALL groups from Facebook ──
    let fbGroups = [];
    try { fbGroups = await fetchAllGroupThreads(api); } catch {}
    clearInterval(anim);

    const total = fbGroups.length;

    edit(
      `╭─────────────────────────╮\n` +
      `│  ♻️  INBOX REFRESH        │\n` +
      `│  ✅ ${total} groups mile!\n` +
      `│  💾 DB update ho raha hai...\n` +
      `│  [░░░░░░░░░░░░] 0%\n` +
      `╰─────────────────────────╯`
    );

    // ── Phase 3: Save all to DB + send ♻️ ──
    let saved = 0, alreadyIn = 0, pinged = 0, pingFailed = 0;
    const pingedThreadIDs = new Set(); // track threads with confirmed messages

    for (let i = 0; i < fbGroups.length; i++) {
      const g = fbGroups[i];

      // Save to DB if not already
      const existing = await Threads.get(g.threadID).catch(() => null);
      if (!existing) {
        try { await Threads.create(g.threadID, g.threadName || ''); saved++; }
        catch {}
      } else {
        alreadyIn++;
        // Update name if changed
        if (g.threadName && g.threadName !== existing.name) {
          try { await Threads.update(g.threadID, { name: g.threadName }); } catch {}
        }
      }

      // Send ♻️ to refresh inbox
      try {
        await new Promise((res, rej) =>
          api.sendMessage('♻️', g.threadID, (err, r) => err ? rej(err) : res(r))
        );
        pinged++;
        pingedThreadIDs.add(g.threadID); // only mark as safe if message sent
      } catch { pingFailed++; }

      // Progress update every 5 groups
      if (i % 5 === 0 || i === fbGroups.length - 1) {
        const p = pct(i + 1, total);
        edit(
          `╭─────────────────────────╮\n` +
          `│  ♻️  REFRESHING...        │\n` +
          `│  📡 Ping: ${i + 1}/${total}\n` +
          `│  [${barStr(i + 1, total)}] ${p}%\n` +
          `│  💾 New: ${saved}  ✅ Pinged: ${pinged}\n` +
          `╰─────────────────────────╯`
        );
      }

      await sleep(250);
    }

    // ── Phase 4: Find DB threads no longer in FB list & DELETE them ──
    const fbIDs = new Set(fbGroups.map(g => g.threadID));
    let dbGroups = [];
    try { dbGroups = await Threads.getAll(); } catch {}

    const leftGroups = dbGroups.filter(t => !fbIDs.has(t.id));
    let deleted = 0;
    for (const t of leftGroups) {
      try { 
        await Threads.delete(t.id);
        deleted++;
      } catch {}
    }

    // ── Phase 5: Set bot nickname in groups where it's missing ──
    const botName = (global.config?.BOTNAME || 'MR DEVIL BOT').trim();
    const botUID  = api.getCurrentUserID();
    let nickSet = 0, nickSkip = 0;

    edit(
      `╭─────────────────────────╮\n` +
      `│  ♻️  NICKNAME CHECK       │\n` +
      `│  🏷️ Nickname set ho raha hai...\n` +
      `│  ${frames[2]}\n` +
      `╰─────────────────────────╯`
    );

    for (const g of fbGroups) {
      // Only set nickname in threads where bot successfully sent a message
      if (!pingedThreadIDs.has(g.threadID)) { nickSkip++; continue; }
      try {
        const info = await new Promise((res, rej) =>
          api.getThreadInfo(g.threadID, (err, d) => err ? rej(err) : res(d))
        );
        // Try both possible paths FCA versions use
        const nicknames = info?.customization?.nicknames
          || info?.nicknames
          || {};
        const current = nicknames[botUID];
        if (!current || current.trim() === '') {
          await new Promise((res, rej) =>
            api.changeNickname(botName, g.threadID, botUID, (err) => err ? rej(err) : res())
          );
          nickSet++;
        } else {
          nickSkip++; // nickname already set — skip
        }
      } catch { nickSkip++; }
      await sleep(300);
    }

    // ── Phase 6: Final result — always send.reply so message arrives even after long process ──
    const lines = [
      `╭───── ♻️ REFRESH DONE ─────╮`,
      `│`,
      `│  📦 FB Groups   : ${total}`,
      `│  🆕 Naye Save   : ${saved}`,
      `│  ✅ Pinged (♻️) : ${pinged}`,
      `│  ❌ Ping Failed : ${pingFailed}`,
      `│  🗑️ Deleted     : ${deleted}`,
      `│  🏷️ Nick Set    : ${nickSet}`,
      `│  ✔️ Nick OK     : ${nickSkip}`,
      `│`,
    ];

    if (leftGroups.length) {
      lines.push(`│  🚪 Left & Deleted:`);
      leftGroups.slice(0, 6).forEach((g, i) => {
        lines.push(`│   ${i + 1}. ${g.name || g.id}`);
      });
      if (leftGroups.length > 6) lines.push(`│   ...+${leftGroups.length - 6} zyada`);
      lines.push(`│`);
    }

    lines.push(`│  💾 Database updated!`);
    lines.push(`│  🏷️ Nickname: ${botName}`);
    lines.push(`│  ♻️ Inbox fully refreshed!`);
    lines.push(`╰────────────────────────────╯`);

    // Use api.sendMessage so the final message always arrives regardless of process duration
    await api.sendMessage(lines.join('\n'), threadID);
  }
};
