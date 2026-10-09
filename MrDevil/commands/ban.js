module.exports = {
  config: {
    credits: "MR DEVIL",
    name: 'ban',
    aliases: ['banuser'],
    description: 'Ban a user from using the bot.',
    usage: 'ban @mention [reason]',
    category: 'Admin',
    prefix: true,
    adminOnly: true
  },
  async run({ api, event, args, send, Users, config }) {
    const { senderID, mentions, messageID } = event;
    const mentionIDs = Object.keys(mentions || {});
    if (!mentionIDs.length) return send.reply('❌ Please mention a user to ban.\nUsage: ' + config.PREFIX + 'ban @user [reason]');

    const reason = args.slice(Object.keys(mentions).length > 0 ? 1 : 0).join(' ') || 'No reason given';
    let msg = '🚫 BAN RESULTS:\n';

    for (const uid of mentionIDs) {
      if (config.ADMINBOT?.includes(uid) || config.ADMINBOT?.includes(String(uid))) { msg += `⚠️ Cannot ban admin ${uid}\n`; continue; }
      Users.ban(uid, reason);
      const name = await Users.getNameUser(uid);
      msg += `✅ Banned: ${name} (${uid})\n📋 Reason: ${reason}\n`;
    }

    send.reply(msg);
  }
};
