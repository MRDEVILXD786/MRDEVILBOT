module.exports = {
  config: {
    credits: "MR DEVIL",
    name: 'nicklock',
    aliases: [],
    description: 'Set and lock nickname for a mentioned user.',
    usage: 'nicklock @user [nickname]',
    category: 'Group',
    prefix: true,
    groupOnly: true
  },
  async run({ api, event, args, send }) {
    const { threadID } = event;
    const mentionIDs = Object.keys(event.mentions || {});
    if (!mentionIDs.length) return send.reply('❌ Please @mention someone.');
    
    const nick = args.slice(1).join(' ');
    if (!nick) return send.reply('❌ Usage: .nicklock @user [nickname]');

    const userID = mentionIDs[0];
    const db = require('../../controller/system/database/index');

    try {
      await api.changeNickname(nick, threadID, userID);

      await db.update(db.nicklocks, { userId: userID, threadId: threadID }, 
        { $set: { userId: userID, threadId: threadID, nickname: nick, lockedAt: Date.now() } }, 
        { upsert: true }
      );

      send.reply(`🔒 Nickname locked to: ${nick}\n\nNow this user cannot change their nickname until you use .nickunlock`);
    } catch (e) {
      send.reply('❌ Failed: ' + e.message);
    }
  }
};