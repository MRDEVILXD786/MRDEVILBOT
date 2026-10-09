const REACTS = [
  "💖", "💗", "💓", "💞", "💝",
  "🌸", "🌺", "🌻", "🌹", "🌷",
  "✨", "🌟", "💫", "⭐", "🎀",
  "🦋", "🌈", "🍀", "🎶", "💎"
];

module.exports = {
  config: {
    credits: "MR DEVIL",
    name: "autoreact",
    eventType: "message",
    description: "Groups mein auto react — har message pe random pyara emoji."
  },

  async run({ api, event, Threads }) {
    const { threadID, messageID, senderID } = event;
    if (!event.body && !event.attachments?.length) return;

    const botID = api.getCurrentUserID();
    if (senderID === botID) return;

    const settings = await Threads.getSettings(threadID);
    if (!settings?.autoreact) return;

    const emoji = REACTS[Math.floor(Math.random() * REACTS.length)];
    try {
      api.setMessageReaction(emoji, messageID, () => {}, true);
    } catch {}
  }
};
