module.exports = {
  config: {
    credits: "MR DEVIL",
    name: 'nickunlockall',
    aliases: [],
    description: 'Unlock all nicknames in the group.',
    usage: 'nickunlockall',
    category: 'Group',
    prefix: true,
    groupOnly: true
  },
  async run({ api, event, send }) {
    const { threadID } = event;
    const db = require('../../controller/system/database/index');

    const locked = await db.findAll(db.nicklocks, { threadId: threadID });
    if (!locked.length) return send.reply('❌ No locked nicknames in this group.');

    await db.remove(db.nicklocks, { threadId: threadID }, { multi: true });

    send.reply(`🔓 All ${locked.length} nicknames have been unlocked!`);
  }
};