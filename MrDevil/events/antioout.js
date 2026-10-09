const fs = require('fs-extra');
const path = require('path');

const dataPath = path.join(__dirname, '../../../data/antioout.json');

function isAntioutEnabled(threadID) {
  try {
    if (fs.existsSync(dataPath)) {
      const data = fs.readJsonSync(dataPath);
      return !!data[threadID];
    }
  } catch {}
  return false;
}

module.exports = {
  config: {
    name: 'antioutHandler',
    eventType: ['log:unsubscribe', 'leave'],
    credits: 'MR DEVIL'
  },

  async run({ api, event, logMessageType, logMessageData, Threads }) {
    if (logMessageType !== 'log:unsubscribe' && logMessageType !== 'leave') return;

    const threadID = event.threadID;
    if (!isAntioutEnabled(threadID)) return;

    const leftUserID = logMessageData?.leftParticipantFbId || event.leftUserFbId || event.author;
    if (!leftUserID) return;

    try {
      await new Promise((resolve, reject) => {
        api.addUserToGroup(leftUserID, threadID, (err) => {
          if (err) reject(err);
          else resolve();
        });
      });

      const userInfo = await new Promise((resolve) => {
        api.getUserInfo(leftUserID, (err, info) => {
          if (err || !info?.[leftUserID]) resolve(leftUserID);
          else resolve(info[leftUserID].name || leftUserID);
        });
      });

      await new Promise((resolve) => {
        setTimeout(resolve, 1000);
      });

      api.sendMessage(
        `♻️ ${userInfo} was auto re-added to the group!`,
        threadID
      );
    } catch (e) {
      const errStr = String(e?.error || e?.message || '').toLowerCase();
      if (errStr.includes('friend')) {
        api.sendMessage(
          `⚠️ Couldn't auto re-add ${leftUserID}\nReason: User is not a friend of the bot.`,
          threadID
        );
      }
    }
  }
};