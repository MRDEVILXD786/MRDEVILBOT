module.exports = {
  config: {
    credits: "MR DEVIL",
    name: 'nickname',
    aliases: ['nick'],
    description: 'Set a nickname for a user.',
    usage: 'nickname @user [nickname]',
    category: 'Group',
    prefix: true,
    groupOnly: true
  },
  async run({ api, event, args, send }) {
    const { threadID } = event;
    const mentionIDs = Object.keys(event.mentions || {});
    if (!mentionIDs.length) return send.reply('❌ Please @mention someone.');
    const nick = args.slice(1).join(' ');
    if (!nick) return send.reply('❌ Usage: .nickname @user [nickname]');

    const userID = mentionIDs[0];
    const db = require('../../controller/system/database/index');
    
    const locked = await db.findOne(db.nicklocks, { userId: userID, threadId: threadID });
    if (locked) return send.reply(`❌ This user's nickname is locked by: ${locked.nickname}\n\nUse .nickunlock @user to unlock.`);

    try {
      await api.changeNickname(nick, threadID, userID);
      send.reply(`✅ Nickname set to: ${nick}`);
    } catch (e) {
      send.reply('❌ Failed: ' + e.message);
    }
  }
};
