module.exports = {
  config: {
    credits: "MR DEVIL",
    name: "autoreact",
    aliases: ["ar", "autolike", "autoemoji"],
    description: "Is group mein auto react on/off karo.",
    usage: "autoreact on | autoreact off",
    category: "Admin",
    prefix: true,
    cooldowns: 3,
    adminOnly: false
  },

  async run({ api, event, args, send, Threads, config, isAdmin }) {
    const { threadID, senderID, messageID } = event;
    if (!isAdmin) {
      return send.reply("❌ Yeh command sirf bot admins use kar sakte hain!");
    }

    const action = (args[0] || "").toLowerCase();
    if (!["on", "off"].includes(action)) {
      const settings = await Threads.getSettings(threadID);
      const status = settings.autoreact ? "✅ ON" : "❌ OFF";
      return send.reply(
        `╭──── 🎯 AUTO REACT ────╮\n` +
        `│\n` +
        `│ Status: ${status}\n` +
        `│\n` +
        `│ Use:\n` +
        `│ ${config.PREFIX}autoreact on\n` +
        `│ ${config.PREFIX}autoreact off\n` +
        `│\n` +
        `╰───────────────────────╯`
      );
    }

    const enable = action === "on";
    await Threads.setSettings(threadID, { autoreact: enable });

    api.setMessageReaction(enable ? "✅" : "❌", messageID, () => {}, true);

    send.reply(
      enable
        ? "✅ Auto React ON kar diya!\n\nAb is group ke har message pe bot randomly react karega 💖"
        : "❌ Auto React OFF kar diya!\n\nAb bot react nahi karega."
    );
  }
};
