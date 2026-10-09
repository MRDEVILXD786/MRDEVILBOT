const logs = require('../../utility/logs');
const Send = require('../../utility/send');

async function handleAutoDetect({ api, event, client, Users, Threads, config }) {
  if (event.senderID) {
    try {
      const isBanned = await Users.isBanned(event.senderID);
      if (isBanned) return;
    } catch {}
  }

  const send = new Send(api, event);

  for (const [name, handler] of client.events) {
    try {
      const et = handler.config.eventType;
      const matches = Array.isArray(et)
        ? et.includes('message')
        : et === 'message';
      if (!matches) continue;
      if (!event.body && !Array.isArray(et)) continue;
      await handler.run({ api, event, send, Users, Threads, config, client });
    } catch (e) { logs.error('AUTO_DETECT', `Error in ${name}: ${e.message}`); }
  }
}

module.exports = handleAutoDetect;
