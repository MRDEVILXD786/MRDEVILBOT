const messageCache = new Map();
const MAX_CACHE = 500;

function cacheMessage(event) {
  const { messageID, threadID, senderID, body, attachments } = event;
  if (!messageID) return;

  if (messageCache.size >= MAX_CACHE) {
    const firstKey = messageCache.keys().next().value;
    messageCache.delete(firstKey);
  }

  messageCache.set(messageID, {
    threadID,
    senderID,
    body: body || "",
    attachments: attachments || [],
    time: Date.now()
  });
}

module.exports = {
  config: {
    credits: "MR DEVIL",
    name: "resend",
    eventType: ["message", "message_unsend"],
    description: "Deleted messages ko wapas group mein send karta hai."
  },

  async run({ api, event, Threads }) {
    const { type, threadID, messageID, senderID } = event;

    if (type === "message" || type === "message_reply") {
      cacheMessage(event);
      return;
    }

    if (type === "message_unsend") {
      const settings = await Threads.getSettings(threadID);
      if (!settings?.resend) return;

      const botID = String(api.getCurrentUserID());
      if (String(senderID) === botID) return;

      const cached = messageCache.get(messageID);
      if (!cached) return;

      const { body, attachments } = cached;

      if (!body && (!attachments || attachments.length === 0)) return;

      let text = `╭──── 🗑️ DELETED MESSAGE ────╮\n│\n`;
      text += `│ 👤 UID: ${senderID}\n`;
      if (body) text += `│ 💬 Message:\n│ "${body}"\n`;
      if (attachments && attachments.length > 0) {
        text += `│ 📎 Attachments: ${attachments.length}\n`;
      }
      text += `│\n╰──────────────────────────╯`;

      try {
        await api.sendMessage(text, threadID);
      } catch {}
    }
  }
};
