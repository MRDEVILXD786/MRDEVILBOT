/*
 * ISLAMIC SCHEDULER — MR DEVIL BOT v2
 * Owner: MR DEVIL
 * Hourly Islamic / motivational messages groups ko bhejta hai
 * (sirf un groups ko jahan autosent ON ho)
 */

const cron = require('node-cron');
const moment = require('moment-timezone');
const logs = require('../../controller/utility/logs');

const ISLAMIC_TEMPLATES = [
  (time, date, zone) =>
    `╭─── « ⏰ WAQT KI YAAD » ───⟡\n` +
    `│\n` +
    `│ 🌸 Assalamu Alaikum Doston! 🌸\n` +
    `│\n` +
    `│ ◈ 🕐 Waqt  : ${time}\n` +
    `│ ◈ 📅 Tarikh: ${date}\n` +
    `│ ◈ 🌍 Zone  : ${zone}\n` +
    `│\n` +
    `│ ✨ "Waqt ki qaddar karo,\n` +
    `│    waqt lautka nahi karta!"\n` +
    `│\n` +
    `│ 💎 — MR DEVIL BOT\n` +
    `│\n` +
    `╰───────────────⟡`,

  (time, date, zone) =>
    `╭─── « 🕌 HOURLY REMINDER » ───⟡\n` +
    `│\n` +
    `│ ☪️ Assalamu Alaikum Wa Rahmatullahi!\n` +
    `│\n` +
    `│ ◈ ⏰ Time  : ${time}\n` +
    `│ ◈ 📅 Date  : ${date}\n` +
    `│ ◈ 🌍 Zone  : ${zone}\n` +
    `│\n` +
    `│ 🤲 "Har ghante mein Allah\n` +
    `│    ko yaad karo!"\n` +
    `│\n` +
    `│ 🌙 — MR DEVIL BOT\n` +
    `│\n` +
    `╰───────────────⟡`,

  (time, date, zone) =>
    `╭─── « 💫 GROUP UPDATE » ───⟡\n` +
    `│\n` +
    `│ 🌟 Kya haal hai doston?\n` +
    `│\n` +
    `│ ◈ 🕐 Waqt  : ${time}\n` +
    `│ ◈ 📅 Tarikh: ${date}\n` +
    `│ ◈ 🌍 Zone  : ${zone}\n` +
    `│\n` +
    `│ 💖 Muskurate raho,\n` +
    `│    zindagi khubsoorat hai!\n` +
    `│\n` +
    `│ 🤖 — MR DEVIL BOT\n` +
    `│\n` +
    `╰───────────────⟡`,

  (time, date, zone) =>
    `╭─── « 🌺 PYARA SA MESSAGE » ───⟡\n` +
    `│\n` +
    `│ 💝 Doston ko salaam!\n` +
    `│\n` +
    `│ ◈ 🕐 Time  : ${time}\n` +
    `│ ◈ 📅 Date  : ${date}\n` +
    `│ ◈ 📍 Zone  : ${zone}\n` +
    `│\n` +
    `│ 🌸 "Dil se dua hai ke\n` +
    `│    aap sab khush raho!"\n` +
    `│\n` +
    `│ ✨ — MR DEVIL BOT\n` +
    `│\n` +
    `╰───────────────⟡`,

  (time, date, zone) =>
    `╭─── « 🎯 WAQT UPDATE » ───⟡\n` +
    `│\n` +
    `│ ⚡ Ek Ghanta Aur Guzar Gaya!\n` +
    `│\n` +
    `│ ◈ 🕐 Waqt  : ${time}\n` +
    `│ ◈ 📅 Tarikh: ${date}\n` +
    `│ ◈ 🌍 Zone  : ${zone}\n` +
    `│\n` +
    `│ 💡 "Har pal qeemti hai,\n` +
    `│    isko waste mat karo!"\n` +
    `│\n` +
    `│ 🌟 — MR DEVIL BOT\n` +
    `│\n` +
    `╰───────────────⟡`,

  (time, date, zone) =>
    `╭─── « 🤲 ISLAMIC REMINDER » ───⟡\n` +
    `│\n` +
    `│ ☪️ Bismillah ir-Rahman ir-Raheem\n` +
    `│\n` +
    `│ ◈ 🕐 Waqt  : ${time}\n` +
    `│ ◈ 📅 Tarikh: ${date}\n` +
    `│ ◈ 🌍 Zone  : ${zone}\n` +
    `│\n` +
    `│ 📖 "SubhanAllah, Alhamdulillah,\n` +
    `│    Allahu Akbar — kaho dil se!"\n` +
    `│\n` +
    `│ 🌙 — MR DEVIL BOT\n` +
    `│\n` +
    `╰───────────────⟡`,

  (time, date, zone) =>
    `╭─── « 🌙 DEEN KI YAAD » ───⟡\n` +
    `│\n` +
    `│ 🌸 Assalamu Alaikum Wa Rahmatullahi Wa Barakatuh!\n` +
    `│\n` +
    `│ ◈ 🕐 Waqt  : ${time}\n` +
    `│ ◈ 📅 Tarikh: ${date}\n` +
    `│ ◈ 🌍 Zone  : ${zone}\n` +
    `│\n` +
    `│ 🤲 "Namaz qaza mat karo —\n` +
    `│    waqt pe ada karo!"\n` +
    `│\n` +
    `│ 💚 — MR DEVIL BOT\n` +
    `│\n` +
    `╰───────────────⟡`,
];

function setupIslamicScheduler(getApi, config, scheduledTasks) {
  const tz = config.TIMEZONE || 'Asia/Karachi';

  const task = cron.schedule('0 * * * *', async () => {
    const api = getApi();
    if (!api) return;
    try {
      const ThreadsModel = require('../../controller/system/database/models/threads');
      const allThreads = await ThreadsModel.getAll();
      const targets = allThreads.filter(t => t?.settings?.islamicScheduler === true);
      if (!targets.length) return;

      const zone = config.TIMEZONE || 'Asia/Karachi';
      const time = moment().tz(zone).format('hh:mm A');
      const date = moment().tz(zone).format('DD/MM/YYYY');

      const tmpl = ISLAMIC_TEMPLATES[Math.floor(Math.random() * ISLAMIC_TEMPLATES.length)];
      const msg = tmpl(time, date, zone);

      for (const t of targets) {
        try {
          await new Promise((res, rej) =>
            api.sendMessage(msg, t.id, (err) => err ? rej(err) : res())
          );
          await new Promise(r => setTimeout(r, 1200));
        } catch (e) {
          logs.error('ISLAMIC_SCHEDULER', `Failed for ${t.id}: ${e.message}`);
        }
      }
      logs.info('ISLAMIC_SCHEDULER', `Hourly messages sent to ${targets.length} groups`);
    } catch (e) {
      logs.error('ISLAMIC_SCHEDULER', e.message);
    }
  }, { timezone: tz });

  scheduledTasks.push(task);
  logs.success('ISLAMIC_SCHEDULER', 'Islamic scheduler started ✅');
}

module.exports = {
  config: {
    credits: 'MR DEVIL',
    name: 'islamicscheduler',
    aliases: ['islamicpost'],
    description: 'Hourly Islamic / motivational messages group mein bhejta hai (autosent on groups ko)',
    usage: 'islamicscheduler on/off',
    category: 'Admin',
    prefix: true,
    adminOnly: true,
    cooldowns: 5
  },

  async run({ api, event, args, send, config }) {
    const { threadID } = event;
    const ThreadsModel = require('../../controller/system/database/models/threads');

    const action = (args[0] || '').toLowerCase();

    if (action === 'on') {
      await ThreadsModel.updateSettings(threadID, { islamicScheduler: true });
      return send.reply(
        `╭─── « ☪️ ISLAMIC SCHEDULER » ───⟡\n` +
        `│\n` +
        `│ ✅ Is group mein ACTIVATE ho gaya!\n` +
        `│ Har ghante Islamic message aayega.\n` +
        `│\n` +
        `│ 🌙 — MR DEVIL BOT\n` +
        `╰───────────────⟡`
      );
    }

    if (action === 'off') {
      await ThreadsModel.updateSettings(threadID, { islamicScheduler: false });
      return send.reply(
        `╭─── « ☪️ ISLAMIC SCHEDULER » ───⟡\n` +
        `│\n` +
        `│ ❌ Is group mein DEACTIVATE ho gaya!\n` +
        `│\n` +
        `│ 🌙 — MR DEVIL BOT\n` +
        `╰───────────────⟡`
      );
    }

    const threadData = await ThreadsModel.getData(threadID);
    const status = threadData?.settings?.islamicScheduler ? '✅ ON' : '❌ OFF';
    return send.reply(
      `╭─── « ☪️ ISLAMIC SCHEDULER » ───⟡\n` +
      `│\n` +
      `│ 📊 Status  : ${status}\n` +
      `│ 🕐 Interval: Har ghante\n` +
      `│\n` +
      `│ 💡 ON karne ke liye:\n` +
      `│    .islamicscheduler on\n` +
      `│ 💡 OFF karne ke liye:\n` +
      `│    .islamicscheduler off\n` +
      `│\n` +
      `│ 🌙 — MR DEVIL BOT\n` +
      `╰───────────────⟡`
    );
  },

  setupIslamicScheduler,
};
