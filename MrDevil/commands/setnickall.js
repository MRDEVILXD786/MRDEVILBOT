module.exports = {
  config: {
    credits: "MR DEVIL",
    name: 'setnickall',
    aliases: [],
    description: 'Set nickname for all group members.',
    usage: 'setnickall [nickname]',
    category: 'Group',
    prefix: true,
    groupOnly: true
  },
  async run({ api, event, args, send }) {
    const { threadID } = event;
    const nick = args.join(' ');
    if (!nick) return send.reply('❌ Usage: .setnickall [nickname]');

    const db = require('../../controller/system/database/index');

    try {
      const threadInfo = await new Promise((resolve, reject) => {
        api.getThreadInfo(threadID, (err, info) => err ? reject(err) : resolve(info));
      });

      const participantIDs = threadInfo.participantIDs || [];
      if (!participantIDs.length) return send.reply('❌ No members found.');

      let success = 0;
      let failed = 0;
      let skipped = 0;

      for (const userID of participantIDs) {
        const locked = await db.findOne(db.nicklocks, { userId: userID, threadId: threadID });
        if (locked) {
          skipped++;
          continue;
        }

        try {
          await api.changeNickname(nick, threadID, userID);
          success++;
        } catch (e) {
          failed++;
        }
      }

      send.reply(`✅ Nickname set for all members!\n\n📊 Success: ${success}\n❌ Failed: ${failed}\n⏭️ Skipped (locked): ${skipped}`);
    } catch (e) {
      send.reply('❌ Failed: ' + e.message);
    }
  }
};