const logs = require('../../utility/logs');
const Send = require('../../utility/send');

async function handleEvent({ api, event, client, Users, Threads, config }) {
  const { threadID, logMessageType, logMessageData, logMessageBody } = event;
  if (!logMessageType) return;
  logs.event(logMessageType, threadID);

  for (const [name, handler] of client.events) {
    try {
      if (handler.config.eventType) {
        if (Array.isArray(handler.config.eventType)) {
          if (!handler.config.eventType.includes(logMessageType)) continue;
        } else if (handler.config.eventType !== logMessageType) continue;
      }
      const send = new Send(api, event);
      console.log('[EVENT_HANDLER] Running event:', name);
      await handler.run({ api, event, send, Users, Threads, config, client, logMessageType, logMessageData, logMessageBody });
    } catch (e) { 
      console.log('[EVENT_HANDLER] Error in', name, ':', e.message);
      logs.error('EVENT', `Error in ${name}: ${e.message}`); 
    }
  }
}

module.exports = handleEvent;
