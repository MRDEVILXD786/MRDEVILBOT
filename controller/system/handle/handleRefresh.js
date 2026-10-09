const fs = require('fs-extra');
const path = require('path');
const logs = require('../../utility/logs');

function clearRequireCache(filePath) {
  const resolved = require.resolve(filePath);
  if (require.cache[resolved]) {
    const mod = require.cache[resolved];
    mod.children?.forEach(child => {
      if (child.id.includes('MrDevil/commands') || child.id.includes('MrDevil/events')) {
        delete require.cache[child.id];
      }
    });
    delete require.cache[resolved];
  }
}

async function loadCommands(client, commandsPath) {
  client.commands.clear();
  let count = 0;
  try {
    const files = fs.readdirSync(commandsPath).filter(f => f.endsWith('.js'));
    for (const file of files) {
      try {
        const filePath = path.join(commandsPath, file);
        clearRequireCache(filePath);
        const command = require(filePath);
        if (command.config?.name) {
          client.commands.set(command.config.name.toLowerCase(), command);
          command.config.aliases?.forEach(alias => client.commands.set(alias.toLowerCase(), command));
          count++;
          logs.success('COMMAND', `Loaded: ${command.config.name}`);
        }
      } catch (e) { logs.error('COMMAND', `Failed: ${file} - ${e.message}`); }
    }
    logs.info('REFRESH', `Loaded ${count} commands`);
    return { success: true, count };
  } catch (e) { logs.error('REFRESH', e.message); return { success: false, error: e.message }; }
}

async function loadEvents(client, eventsPath) {
  client.events.clear();
  try {
    const files = fs.readdirSync(eventsPath).filter(f => f.endsWith('.js'));
    for (const file of files) {
      try {
        const filePath = path.join(eventsPath, file);
        clearRequireCache(filePath);
        const event = require(filePath);
        if (event.config?.name) {
          client.events.set(event.config.name.toLowerCase(), event);
          logs.success('EVENT', `Loaded: ${event.config.name}`);
        }
      } catch (e) { logs.error('EVENT', `Failed: ${file} - ${e.message}`); }
    }
    logs.info('REFRESH', `Loaded ${client.events.size} events`);
    return { success: true, count: client.events.size };
  } catch (e) { logs.error('REFRESH', e.message); return { success: false, error: e.message }; }
}

async function reloadEvent(client, eventsPath, eventName) {
  try {
    const lowerName = eventName.toLowerCase();
    let filePath = path.join(eventsPath, `${lowerName}.js`);
    if (!fs.existsSync(filePath)) {
      const files = fs.readdirSync(eventsPath).filter(f => f.endsWith('.js'));
      let found = false;
      for (const file of files) {
        const tmp = path.join(eventsPath, file);
        try {
          clearRequireCache(tmp);
          const evt = require(tmp);
          if (evt.config?.name?.toLowerCase() === lowerName) {
            filePath = tmp; found = true; break;
          }
        } catch {}
      }
      if (!found) return { success: false, error: `Event "${eventName}" not found` };
    }
    clearRequireCache(filePath);
    const event = require(filePath);
    if (event.config?.name) {
      client.events.delete(event.config.name.toLowerCase());
      client.events.set(event.config.name.toLowerCase(), event);
      return { success: true, name: event.config.name };
    }
    return { success: false, error: 'Invalid event structure' };
  } catch (e) { return { success: false, error: e.message }; }
}

async function loadNewCommand(client, commandsPath, commandName) {
  try {
    const lowerName = commandName.toLowerCase();
    const filePath = path.join(commandsPath, `${lowerName}.js`);
    if (!fs.existsSync(filePath)) return { success: false, error: `File "${lowerName}.js" not found` };
    clearRequireCache(filePath);
    const command = require(filePath);
    if (!command.config?.name) return { success: false, error: 'Invalid command structure' };
    client.commands.set(command.config.name.toLowerCase(), command);
    command.config.aliases?.forEach(a => client.commands.set(a.toLowerCase(), command));
    return { success: true, name: command.config.name };
  } catch (e) { return { success: false, error: e.message }; }
}

async function reloadCommand(client, commandsPath, commandName) {
  try {
    const lowerName = commandName.toLowerCase();
    let filePath = path.join(commandsPath, `${lowerName}.js`);
    if (!fs.existsSync(filePath)) {
      const files = fs.readdirSync(commandsPath).filter(f => f.endsWith('.js'));
      let found = false;
      for (const file of files) {
        const tmp = path.join(commandsPath, file);
        try {
          clearRequireCache(tmp);
          const cmd = require(tmp);
          if (cmd.config?.name?.toLowerCase() === lowerName || cmd.config?.aliases?.map(a => a.toLowerCase()).includes(lowerName)) {
            filePath = tmp; found = true; break;
          }
        } catch {}
      }
      if (!found) return { success: false, error: `Command "${commandName}" not found` };
    }
    clearRequireCache(filePath);
    const command = require(filePath);
    if (command.config?.name) {
      const oldKeys = [...client.commands.entries()].filter(([k, v]) => v.config?.name?.toLowerCase() === command.config.name.toLowerCase()).map(([k]) => k);
      oldKeys.forEach(k => client.commands.delete(k));
      client.commands.set(command.config.name.toLowerCase(), command);
      command.config.aliases?.forEach(a => client.commands.set(a.toLowerCase(), command));
      return { success: true, name: command.config.name };
    }
    return { success: false, error: 'Invalid command structure' };
  } catch (e) { return { success: false, error: e.message }; }
}

module.exports = { loadCommands, loadEvents, reloadCommand, reloadEvent, loadNewCommand, clearRequireCache };
