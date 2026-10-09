module.exports = {
  config: {
    credits: "MR DEVIL",
    name: 'adminchange',
    eventType: 'log:generic',
    description: 'Notify when admin status changes.'
  },
  async run({ api, event, Users }) {
    const { threadID, logMessageBody } = event;
    if (!logMessageBody) return;

    const lower = logMessageBody.toLowerCase();
    if (!lower.includes('admin')) return;

    try {
      const threadInfo = await api.getThreadInfo(threadID);
      const admins = threadInfo.adminIDs?.length || 0;
      api.sendMessage(`👑 Admin change detected!\n📊 Total admins: ${admins}`, threadID);
    } catch {}
  }
};
