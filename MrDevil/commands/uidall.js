const moment = require('moment-timezone');

const sleep   = ms => new Promise(r => setTimeout(r, ms));
const editMsg = (api, text, msgID) => { try { api.editMessage(text, msgID); } catch {} };
const sendMsg = (api, text, tid, replyTo) =>
  new Promise(r => api.sendMessage(text, tid, (e, i) => r(i), replyTo));

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
  return [...String(str)].map(c => map[c] || c).join('');
}
function numB(n) {
  const m = ['𝟬','𝟭','𝟮','𝟯','𝟰','𝟱','𝟲','𝟳','𝟴','𝟵'];
  return String(n).split('').map(d => m[+d] || d).join('');
}

/**
 * Mrdevilfca getUserInfo source behaviour:
 *  - If API returns profiles → each uid in profiles = live user data
 *  - If a uid is missing from profiles → that uid is dead/suspended (removed from response)
 *  - If entire API call fails (no profiles object) → fallback: ALL ids get
 *      { name:"Facebook User", vanity: uid_string, profileUrl:"...profile.php?id=uid" }
 *
 * So:
 *   undefined          → dead / suspended
 *   name="Facebook User" && vanity===String(uid) → Mrdevilfca fallback (API fail) → unknown
 *   anything else      → live user
 */
function classifyUser(info, uid) {
  if (!info) return 'dead';
  const name  = (info.name || '').trim();
  if (!name)  return 'dead';
  // Mrdevilfca fallback pattern: name exactly "Facebook User" AND vanity equals the uid itself
  if (name === 'Facebook User' && String(info.vanity) === String(uid)) return 'unknown';
  return 'alive';
}

async function fetchAllUserInfo(api, ids) {
  const result = {};
  const BATCH  = 10; // small batches — more reliable with Mrdevilfca
  for (let i = 0; i < ids.length; i += BATCH) {
    const chunk = ids.slice(i, i + BATCH);
    try {
      const data = await new Promise((res, rej) =>
        api.getUserInfo(chunk, (err, d) => err ? rej(err) : res(d))
      );
      if (data) Object.assign(result, data);
    } catch (_) {
      // chunk failed — those ids stay missing in result = dead
    }
    if (i + BATCH < ids.length) await sleep(350);
  }
  return result;
}

module.exports = {
  config: {
    credits: "MR DEVIL",
    name: 'uidall',
    aliases: ['alluid', 'memberuid', 'muids'],
    description: 'Group ke tamam members ki UID with name. Dead/suspended detect karo.',
    usage: 'uidall',
    category: 'Group',
    prefix: true,
    groupOnly: true
  },

  async run({ api, event, config }) {
    const { threadID, messageID } = event;
    const time = moment().tz(config.TIMEZONE || 'Asia/Karachi').format('hh:mm A | DD/MM/YYYY');

    const sent = await sendMsg(api,
      `╭─── « 👥 UID ALL » ───⟡\n│\n│ ⌛ ▱▱▱▱▱▱▱▱▱▱ 𝟬%\n│    Members fetch ho rahe hain...\n│\n╰───────────────⟡`,
      threadID, messageID
    );

    await sleep(600);
    editMsg(api,
      `╭─── « 👥 UID ALL » ───⟡\n│\n│ 🔄 ▰▰▰▰▰▱▱▱▱▱ 𝟱𝟬%\n│    Accounts check ho rahe hain...\n│\n╰───────────────⟡`,
      sent.messageID
    );

    try {
      const threadInfo = await new Promise((res, rej) =>
        api.getThreadInfo(threadID, (e, d) => e ? rej(e) : res(d))
      );

      const groupName  = threadInfo.threadName || 'Unknown Group';
      const botID      = String(api.getCurrentUserID());
      const adminIDs   = new Set((threadInfo.adminIDs || []).map(a => String(a.id || a)));
      const participants = (threadInfo.participantIDs || []).filter(id => String(id) !== botID);

      if (!participants.length) {
        editMsg(api,
          `╭─── « ❌ UID ALL » ───⟡\n│\n│ ⊳ Koi member nahi mila!\n│\n╰───────────────⟡`,
          sent.messageID
        );
        return;
      }

      const userMap = await fetchAllUserInfo(api, participants);

      editMsg(api,
        `╭─── « 👥 UID ALL » ───⟡\n│\n│ ✅ ▰▰▰▰▰▰▰▰▰▰ 𝟭𝟬𝟬%\n│    Done! List bhej raha hun...\n│\n╰───────────────⟡`,
        sent.messageID
      );
      await sleep(400);

      const alive   = [];
      const dead    = [];
      const unknown = [];

      for (const uid of participants) {
        const info    = userMap[uid];
        const status  = classifyUser(info, uid);
        const isAdmin = adminIDs.has(String(uid));
        const name    = info?.name || '';

        if (status === 'alive')   alive.push({ uid, name, isAdmin });
        else if (status === 'dead')    dead.push({ uid, isAdmin });
        else                         unknown.push({ uid, isAdmin });
      }

      const all   = [...alive, ...dead, ...unknown];
      const total = all.length;

      const CHUNK = 25;
      const pages = Math.ceil(all.length / CHUNK);

      for (let p = 0; p < pages; p++) {
        const slice  = all.slice(p * CHUNK, (p + 1) * CHUNK);
        const startN = p * CHUNK + 1;

        let msg = '';
        if (p === 0) {
          msg += `╭─── « 👥 ${bold('UID ALL')} » ───⟡\n│\n`;
          msg += `│ 🏠 ${bold('Group')}   : ${groupName}\n`;
          msg += `│ 👥 ${bold('Members')} : ${numB(total)}\n`;
          msg += `│ ✅ ${bold('Active')}  : ${numB(alive.length)}\n`;
          if (dead.length)    msg += `│ ☠️ ${bold('Dead')}    : ${numB(dead.length)}\n`;
          if (unknown.length) msg += `│ ❓ ${bold('Unknown')} : ${numB(unknown.length)}\n`;
          msg += `│ 🕐 ${bold('Time')}    : ${time}\n│\n`;
          if (pages > 1) msg += `│ 📄 Page 𝟭 / ${numB(pages)}\n│\n`;
        } else {
          msg += `╭─── « 👥 ${bold('UID ALL')} » ───⟡\n│ 📄 Page ${numB(p+1)} / ${numB(pages)}\n│\n`;
        }

        for (let i = 0; i < slice.length; i++) {
          const entry = slice[i];
          const num   = numB(startN + i);
          let icon, label;

          if (entry.name) {
            icon  = entry.isAdmin ? '👑' : '◈';
            label = entry.name;
          } else if (!userMap[entry.uid]) {
            icon  = '☠️';
            label = bold('Dead / Suspended');
          } else {
            icon  = '❓';
            label = bold('Unknown (API Failed)');
          }

          msg += `│ ${icon} [${num}] ${label}\n│      ↳ ${entry.uid}\n`;
        }

        msg += `│\n╰───────────────⟡`;

        if (p === 0) {
          await api.sendMessage(msg, threadID, messageID);
        } else {
          await sleep(700);
          await api.sendMessage(msg, threadID);
        }
      }

    } catch (err) {
      editMsg(api,
        `╭─── « ❌ ERROR » ───⟡\n│\n│ ⊳ ${err.message || err}\n│\n│ 🔁 Dobara try karo.\n╰───────────────⟡`,
        sent.messageID
      );
    }
  }
};
