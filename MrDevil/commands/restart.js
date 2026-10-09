module.exports = {
  config: {
    credits: "MR DEVIL",
    name: 'restart',
    aliases: ['reboot'],
    description: 'Restart the bot.',
    usage: 'restart',
    category: 'Admin',
    prefix: true,
    adminOnly: true
  },
  async run({ api, event, send }) {
    await send.reply('🔄 Restarting MR DEVIL BOT...\nPlease wait a moment! ⏰');
    setTimeout(() => process.exit(1), 2000);
  }
};
