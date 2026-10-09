module.exports = {
  config: {
    credits: "MR DEVIL",
    name: 'settheme',
    aliases: ['theme', 'color'],
    description: 'Change group chat theme/color.',
    usage: 'settheme [color code or name]',
    category: 'Group',
    prefix: true,
    groupOnly: true
  },
  async run({ api, event, args, send }) {
    const { threadID } = event;
    const themes = {
      'red': '#e68585', 'blue': '#0084ff', 'green': '#13cf13',
      'purple': '#a695c7', 'pink': '#f7a8d8', 'orange': '#ff7e29',
      'yellow': '#f5a623', 'dark': '#1e1e1e', 'teal': '#0edcdc'
    };

    if (!args[0]) {
      const list = Object.keys(themes).join(', ');
      return send.reply(`🎨 Available themes:\n${list}\n\nUsage: .settheme [name/hex]`);
    }

    const input = args[0].toLowerCase();
    const color = themes[input] || (input.startsWith('#') ? input : null);
    if (!color) return send.reply(`❌ Invalid color.\nAvailable: ${Object.keys(themes).join(', ')}`);

    try {
      await api.changeThreadColor(color, threadID);
      send.reply(`✅ Theme changed to ${input}!`);
    } catch (e) {
      send.reply('❌ Failed: ' + e.message);
    }
  }
};
