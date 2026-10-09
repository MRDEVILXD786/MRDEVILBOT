module.exports = {
  config: {
    credits: "MR DEVIL",
    name: 'autoseen',
    aliases: ['autoread', 'seen'],
    description: 'Enable/disable auto seen for this group.',
    usage: 'autoseen [on/off/status]',
    category: 'Group',
    prefix: true,
    groupOnly: false
  },
  async run({ api, event, args, Threads }) {
    const { threadID } = event;
    const action = args[0]?.toLowerCase();

    if (!action || action === 'status') {
      const settings = await Threads.getSettings(threadID);
      const enabled = settings.autoseen === true;
      const status = enabled ? '✅ ON' : '❌ OFF';
      
      return api.sendMessage(
        `╭──── 📖 AUTOSEEN ────⟡\n│\n│ Status: ${status}\n│\n│ Usage:\n│   .autoseen on - Enable\n│   .autoseen off - Disable\n╰────────────────────⟡`,
        threadID
      );
    }

    if (!['on', 'off'].includes(action)) {
      return api.sendMessage('❌ Usage: .autoseen [on/off/status]', threadID);
    }

    if (action === 'on') {
      await Threads.setSettings(threadID, { autoseen: true });
      
      return api.sendMessage(
        `✅ AUTOSEEN ENABLED!\n\n` +
        `Bot is group ki sab messages seen karayega.`,
        threadID
      );
    } else {
      await Threads.setSettings(threadID, { autoseen: false });
      
      return api.sendMessage(
        `❌ AUTOSEEN DISABLED!\n\n` +
        `Bot is group mein messages seen nahi karayega.`,
        threadID
      );
    }
  }
};