module.exports = {
  config: {
    credits: "MR DEVIL",
    name: 'kick',
    aliases: ['remove', 'out'],
    description: 'Kick a member from the group.',
    usage: 'kick @mention',
    category: 'Group',
    prefix: true,
    groupOnly: true
  },
  async run({ api, event, send, Users, config, isAdmin }) {
    const { threadID, senderID } = event;
    const mentionIDs = Object.keys(event.mentions || {});
    if (!mentionIDs.length) return send.reply('❌ Please mention a user to kick.');
    let threadInfo;
    try { threadInfo = await api.getThreadInfo(threadID); } catch { return send.reply('❌ Could not get group info.'); }
    if (!threadInfo) return send.reply('❌ Could not get group info.');

    const groupAdmins = threadInfo.adminIDs?.map(a => a.uid) || [];
    if (!isAdmin && !groupAdmins.includes(senderID)) {
      return send.reply('❌ Only group admins can kick members.');
    }

    for (const uid of mentionIDs) {
      if (config.ADMINBOT?.includes(uid) || config.ADMINBOT?.includes(String(uid))) { await send.reply('⚠️ Cannot kick bot admin.'); continue; }
      try {
        await api.removeUserFromGroup(uid, threadID);
        const name = await Users.getNameUser(uid);
        await send.reply(`✅ Kicked: ${name}`);
      } catch (e) { await send.reply(`❌ Failed to kick ${uid}: ${e.message}`); }
    }
  }
};
