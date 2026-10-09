const axios = require('axios');

function extractUIDFromUrl(input) {
  try {
    let url = input.trim();
    if (!url.startsWith('http')) {
      url = 'https://' + url
        .replace(/^(www\.)?(fb|facebook)\.com\//, 'www.facebook.com/')
        .replace(/^(?!www\.)facebook\.com\//, 'www.facebook.com/');
      if (!url.startsWith('https://')) url = 'https://' + url;
    }
    url = url
      .replace('https://fb.com/', 'https://www.facebook.com/')
      .replace('https://m.facebook.com/', 'https://www.facebook.com/')
      .replace('https://facebook.com/', 'https://www.facebook.com/');

    const parsed = new URL(url);
    const idParam = parsed.searchParams.get('id');
    if (idParam && /^\d+$/.test(idParam)) return { uid: idParam, username: null };

    const pathMatch = parsed.pathname.match(/^\/([^/?]+)/);
    if (pathMatch) {
      const slug = pathMatch[1];
      if (/^\d+$/.test(slug)) return { uid: slug, username: null };
      if (slug && slug !== 'profile.php') return { uid: null, username: slug };
    }
  } catch {}
  return null;
}

async function resolveUsernameToUID(username) {
  try {
    const res = await axios.get(`https://www.facebook.com/${username}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept-Language': 'en-US,en;q=0.9'
      },
      timeout: 15000,
      maxRedirects: 5
    });
    const html = res.data;
    const patterns = [
      /"userID":"(\d+)"/,
      /"USER_ID":"(\d+)"/,
      /entity_id["\s:]+(\d{8,})/,
      /"id":"(\d{8,})"/,
      /profile_id=(\d{8,})/,
      /"owner":{"__typename":"User","id":"(\d+)"/,
      /\\"userID\\":\\"(\d+)\\"/
    ];
    for (const pattern of patterns) {
      const match = html.match(pattern);
      if (match && /^\d{8,}$/.test(match[1])) return match[1];
    }
    return null;
  } catch {
    return null;
  }
}

async function resolveInput(input) {
  const trimmed = input.trim();
  if (!trimmed) return null;

  if (/^\d+$/.test(trimmed)) return { uid: trimmed, raw: trimmed };

  if (trimmed.includes('facebook.com') || trimmed.includes('fb.com') || trimmed.includes('/')) {
    const parsed = extractUIDFromUrl(trimmed);
    if (!parsed) return { uid: null, raw: trimmed, error: 'invalid_link' };
    if (parsed.uid) return { uid: parsed.uid, raw: trimmed };
    if (parsed.username) {
      const uid = await resolveUsernameToUID(parsed.username);
      if (uid) return { uid, raw: trimmed };
      return { uid: null, raw: trimmed, error: 'not_found' };
    }
  }

  return { uid: null, raw: trimmed, error: 'invalid_input' };
}

module.exports = {
  config: {
    credits: "MR DEVIL",
    name: 'add',
    aliases: ['adduser', 'addmember'],
    description: 'UID ya Facebook profile link se ek ya multiple users ko group mein add karo.',
    usage: 'add <UID/link> [UID/link] [UID/link] ...',
    category: 'Group',
    prefix: true,
    groupOnly: true,
    adminOnly: false
  },

  async run({ api, event, args, send, config, isAdmin }) {
    const { threadID, senderID, messageID } = event;
    if (!isAdmin) {
      return send.reply(
        `╭─── « ❌ ACCESS DENIED » ───⟡\n` +
        `│\n` +
        `│ 🚫 Yeh command sirf Bot\n` +
        `│    Admins use kar sakte hain!\n` +
        `│\n` +
        `╰───────────────⟡`
      );
    }

    const rawInputs = args.join(' ').trim();
    if (!rawInputs) {
      return send.reply(
        `╭──── « ➕ ADD USER » ────⟡\n` +
        `│\n` +
        `│ ❓ UID ya profile link bhejo!\n` +
        `│\n` +
        `│ 📌 Single:\n` +
        `│  .add 100000000000000\n` +
        `│  .add fb.com/username\n` +
        `│\n` +
        `│ 📌 Multiple:\n` +
        `│  .add uid1 uid2 uid3\n` +
        `│  .add link1 link2\n` +
        `│  .add uid1 link1 uid2\n` +
        `│\n` +
        `╰───────────────⟡`
      );
    }

    const tokens = rawInputs.split(/\s+/).filter(Boolean);

    const mergedTokens = [];
    let i = 0;
    while (i < tokens.length) {
      if (
        (tokens[i].startsWith('http') || tokens[i].includes('facebook.com') || tokens[i].includes('fb.com')) &&
        i + 1 < tokens.length &&
        !tokens[i + 1].startsWith('http') &&
        !tokens[i + 1].includes('facebook.com') &&
        !tokens[i + 1].includes('fb.com') &&
        !(/^\d+$/.test(tokens[i + 1]))
      ) {
        mergedTokens.push(tokens[i] + ' ' + tokens[i + 1]);
        i += 2;
      } else {
        mergedTokens.push(tokens[i]);
        i++;
      }
    }

    if (mergedTokens.length === 0) {
      return send.reply(`❌ Koi valid input nahi mila!`);
    }

    api.setMessageReaction('⏳', messageID, () => {}, true);

    const resolved = await Promise.all(mergedTokens.map(t => resolveInput(t)));

    const results = { success: [], failed: [], skipped: [] };

    for (const item of resolved) {
      if (!item || item.error === 'invalid_input') {
        results.skipped.push({ raw: item?.raw || '?', reason: 'Invalid input' });
        continue;
      }
      if (item.error === 'invalid_link') {
        results.skipped.push({ raw: item.raw, reason: 'Invalid link' });
        continue;
      }
      if (item.error === 'not_found') {
        results.skipped.push({ raw: item.raw, reason: 'UID not found' });
        continue;
      }

      const { uid, raw } = item;

      let userName = uid;
      try {
        const info = await new Promise((resolve) => {
          api.getUserInfo(uid, (err, data) => {
            if (err || !data) return resolve(null);
            resolve(data[uid] || null);
          });
        });
        if (info?.name) userName = info.name;
      } catch {}

      try {
        await api.addUserToGroup(uid, threadID);
        results.success.push({ uid, name: userName });
      } catch (e) {
        const errMsg = e.message || 'Unknown error';
        let reason = errMsg.slice(0, 50);
        if (errMsg.includes('friend')) reason = 'Not a friend of bot';
        else if (errMsg.includes('already') || errMsg.includes('member')) reason = 'Already in group';
        else if (errMsg.includes('permission') || errMsg.includes('admin')) reason = 'Bot needs admin rights';
        results.failed.push({ uid, name: userName, reason });
      }

      await new Promise(r => setTimeout(r, 800));
    }

    const total = resolved.length;
    const sCount = results.success.length;
    const fCount = results.failed.length;
    const skCount = results.skipped.length;

    let msg = `╭──── « ➕ ADD USERS RESULT » ────⟡\n│\n`;
    msg += `│ 📊 Total  : ${total}\n`;
    msg += `│ ✅ Added  : ${sCount}\n`;
    msg += `│ ❌ Failed : ${fCount}\n`;
    if (skCount > 0) msg += `│ ⚠️ Skipped: ${skCount}\n`;
    msg += `│\n`;

    if (results.success.length > 0) {
      msg += `│ ✅ Successfully Added:\n`;
      results.success.forEach((u, idx) => {
        msg += `│  ${idx + 1}. ${u.name}\n│     UID: ${u.uid}\n`;
      });
      msg += `│\n`;
    }

    if (results.failed.length > 0) {
      msg += `│ ❌ Failed:\n`;
      results.failed.forEach((u, idx) => {
        msg += `│  ${idx + 1}. ${u.name}\n│     ⚠️ ${u.reason}\n`;
      });
      msg += `│\n`;
    }

    if (results.skipped.length > 0) {
      msg += `│ ⚠️ Skipped:\n`;
      results.skipped.forEach((u, idx) => {
        msg += `│  ${idx + 1}. ${u.raw.slice(0, 30)}\n│     ${u.reason}\n`;
      });
      msg += `│\n`;
    }

    msg += `╰─────────────────────────────⟡`;

    api.setMessageReaction(sCount > 0 ? '✅' : '❌', messageID, () => {}, true);
    send.reply(msg);
  }
};
