module.exports = {
  config: {
    credits: "MR DEVIL",
    name: 'out',
    aliases: ['leave', 'botout'],
    description: 'Bot group se leave kar dega owner ke hukam par.',
    usage: 'out',
    category: 'Admin',
    prefix: true,
    adminOnly: true,
    groupOnly: true
  },
  async run({ api, event, config }) {
    const { threadID } = event;
    const botName = config.BOTNAME || '🌟 MR DEVIL BOT 🌟';

    const msg = `${botName} left kr rhi hu\n👑 Owner ka hukam hy 🫡`;

    await new Promise((resolve) => {
      api.sendMessage(msg, threadID, () => resolve());
    });

    setTimeout(() => {
      try {
        const botID = api.getCurrentUserID();
        api.removeUserFromGroup(botID, threadID);
      } catch {}
    }, 1500);
  }
};
