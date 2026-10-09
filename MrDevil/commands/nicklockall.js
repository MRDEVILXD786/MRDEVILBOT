module.exports = {
  config: {
    credits: "MR DEVIL",
    name: 'nicklockall',
    aliases: [],
    description: 'Set and lock nickname for all group members.',
    usage: 'nicklockall [nickname]',
    category: 'Group',
    prefix: true,
    groupOnly: true
  },
  async run({ api, event, args, send }) {
    const { threadID } = event;
    const nick = args.join(' ');
    if (!nick) return send.reply('❌ Usage: .nicklockall [nickname]');

    const db = require('../../controller/system/database/index');

    try {
      const threadInfo = await new Promise((resolve, reject) => {
        api.getThreadInfo(threadID, (err, info) => err ? reject(err) : resolve(info));
      });

      const participantIDs = threadInfo.participantIDs || [];
      if (!participantIDs.length) return send.reply('❌ No members found.');

      let success = 0;
      let failed = 0;

      for (const userID of participantIDs) {
        try {
          await api.changeNickname(nick, threadID, userID);

          await db.update(db.nicklocks, { userId: userID, threadId: threadID }, 
            { $set: { userId: userID, threadId: threadID, nickname: nick, lockedAt: Date.now() } }, 
            { upsert: true }
          );
          success++;
        } catch (e) {
          failed++;
        }
      }

      send.reply(`🔒 All nicknames locked!\n\n📊 Success: ${success}\n❌ Failed: ${failed}\n\nNow no one can change their nickname until you use .nickunlockall`);
    } catch (e) {
      send.reply('❌ Failed: ' + e.message);
    }
  }
};