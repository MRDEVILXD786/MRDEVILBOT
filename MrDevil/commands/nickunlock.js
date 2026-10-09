module.exports = {
  config: {
    credits: "MR DEVIL",
    name: 'nickunlock',
    aliases: [],
    description: 'Unlock nickname for a mentioned user.',
    usage: 'nickunlock @user',
    category: 'Group',
    prefix: true,
    groupOnly: true
  },
  async run({ api, event, args, send }) {
    const { threadID } = event;
    const mentionIDs = Object.keys(event.mentions || {});
    if (!mentionIDs.length) return send.reply('❌ Please @mention someone.');

    const userID = mentionIDs[0];
    const db = require('../../controller/system/database/index');

    const locked = await db.findOne(db.nicklocks, { userId: userID, threadId: threadID });
    if (!locked) return send.reply('❌ This user\'s nickname is not locked.');

    await db.remove(db.nicklocks, { userId: userID, threadId: threadID }, {});

    send.reply(`🔓 Nickname unlocked for user!`);
  }
};