const fs = require("fs-extra");
const path = require("path");

const snbGroupsFile = path.join(__dirname, "../../Data/system/snb_groups.json");

function loadSnbGroups() {
  try {
    if (fs.existsSync(snbGroupsFile)) return fs.readJsonSync(snbGroupsFile);
  } catch {}
  return [];
}

function saveSnbGroups(groups) {
  try {
    fs.ensureDirSync(path.dirname(snbGroupsFile));
    fs.writeJsonSync(snbGroupsFile, groups);
  } catch {}
}

function addSnbGroup(groupID) {
  const groups = loadSnbGroups();
  if (!groups.includes(groupID)) {
    groups.push(groupID);
    saveSnbGroups(groups);
  }
}

module.exports = {
  config: {
    credits: "MR DEVIL",
    name: "snb",
    aliases: ["sharenewbot", "newbot"],
    description: "Nayi bot profile share karo sab groups mein",
    usage: "snb [profile link ya UID] [optional message]",
    category: "Admin",
    adminOnly: true,
    prefix: true,
    cooldowns: 10
  },

  async run({ api, event, args, send, config }) {
    const { threadID, messageID } = event;

    if (args.length === 0) {
      return send.reply(
        `╭─── « ⚠️ SNB COMMAND » ───⟡\n` +
        `│\n` +
        `│ ❌ Profile link ya UID dena zaruri hai!\n` +
        `│\n` +
        `│ 💡 Usage:\n` +
        `│    .snb [link/UID] [message]\n` +
        `│\n` +
        `│ 📌 Example:\n` +
        `│    .snb 100xxxxxxx Naya bot add karo!\n` +
        `│\n` +
        `╰───────────────⟡`
      );
    }

    const input = args[0];
    const additionalMsg = args.slice(1).join(" ") || "";

    let targetID = input;
    if (input.includes("facebook.com") || input.includes("fb.com")) {
      try {
        targetID = await api.getUID(input);
      } catch {
        const match = input.match(/(?:profile\.php\?id=)?(\d+)/);
        if (match) targetID = match[1];
      }
    }

    if (!targetID || isNaN(targetID)) {
      return send.reply(
        `╭─── « ❌ INVALID UID » ───⟡\n│\n│ ⚠️ Valid Facebook UID ya link\n│    provide karo!\n│\n╰───────────────⟡`
      );
    }

    let groups = [];
    try {
      const threadList = await api.getThreadList(500, null, ["INBOX"]);
      groups = threadList.filter(t => t.isGroup);
    } catch {
      return send.reply(
        `╭─── « ❌ ERROR » ───⟡\n│\n│ ⚠️ Groups list nahi mil saki!\n│\n╰───────────────⟡`
      );
    }

    if (!groups.length) {
      return send.reply(
        `╭─── « ❌ NO GROUPS » ───⟡\n│\n│ ⚠️ Koi group nahi mila!\n│\n╰───────────────⟡`
      );
    }

    send.reply(
      `╭─── « 📤 SNB STARTED » ───⟡\n` +
      `│\n` +
      `│ 🤖 Total Groups: ${groups.length}\n` +
      `│ ⚡ Sharing shuru ho gaya...\n` +
      `│ ⏳ Thoda waqt lage ga!\n` +
      `│\n` +
      `╰───────────────⟡`
    );

    const botName = config?.BOTNAME || "MR DEVIL BOT";
    const broadcastMsg = (
      `╭─── « 🤖 NEW BOT ALERT » ───⟡\n` +
      `│\n` +
      `│ 📢 Naya Bot Available Hai!\n` +
      `│\n` +
      `│ ✅ Is ID pe ab naya bot hai,\n` +
      `│    isay group mein add kar lo!\n` +
      (additionalMsg ? `│\n│ 📝 ${additionalMsg}\n` : "") +
      `│\n` +
      `│ 🌟 — ${botName}\n` +
      `╰───────────────⟡`
    ).trim();

    let success = 0;
    let fail = 0;

    for (const group of groups) {
      try {
        const gid = group.threadID || group.id;
        await api.shareContact(broadcastMsg, targetID, gid);
        addSnbGroup(gid);
        success++;
        await new Promise(r => setTimeout(r, 3000));
      } catch {
        fail++;
      }
    }

    return send.reply(
      `╭─── « ✅ SNB COMPLETE » ───⟡\n` +
      `│\n` +
      `│ 📊 Total Groups : ${groups.length}\n` +
      `│ ✅ Successful   : ${success}\n` +
      `│ ❌ Failed       : ${fail}\n` +
      `│ 💾 Saved        : ${success}\n` +
      `│\n` +
      `│ 🤖 — ${botName}\n` +
      `╰───────────────⟡`
    );
  }
};
