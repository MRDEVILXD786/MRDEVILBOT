const fs = require('fs-extra');
const path = require('path');

const dataPath = path.join(__dirname, '../../../data/antioout.json');

function loadData() {
  try {
    if (fs.existsSync(dataPath)) {
      return fs.readJsonSync(dataPath);
    }
  } catch {}
  return {};
}

function saveData(data) {
  try {
    fs.ensureDirSync(path.dirname(dataPath));
    fs.writeJsonSync(dataPath, data, { spaces: 2 });
  } catch {}
}

module.exports = {
  config: {
    credits: "MR DEVIL",
    name: 'antiout',
    aliases: ['antiout', 'autorejoin'],
    description: 'Auto re-add users who leave the group.',
    usage: 'antiout [on/off]',
    category: 'Admin',
    prefix: true,
    adminOnly: true
  },
  async run({ event, args, send, Threads }) {
    const { threadID } = event;
    const action = args[0]?.toLowerCase();

    if (!action || !['on', 'off'].includes(action)) {
      const data = loadData();
      const status = data[threadID] ? '🔛 ON' : '🔴 OFF';
      return send.reply(`Anti-Out Status: ${status}\nUsage: .antiout [on/off]`);
    }

    const data = loadData();
    if (action === 'on') {
      data[threadID] = true;
      saveData(data);
      send.reply('🔛 Anti-Out is now ENABLED!\nBot will auto re-add users who leave.');
    } else {
      delete data[threadID];
      saveData(data);
      send.reply('🔴 Anti-Out is now DISABLED!');
    }
  }
};