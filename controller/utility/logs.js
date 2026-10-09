const chalk = require('chalk');
const moment = require('moment-timezone');
const fs = require('fs-extra');
const path = require('path');
const EventEmitter = require('events');

const logDir = path.join(__dirname, '../system/database/botdata/logs');
fs.ensureDirSync(logDir);

const getTime = () => moment().tz('Asia/Karachi').format('hh:mm:ss A');
const getDate = () => moment().tz('Asia/Karachi').format('DD/MM/YYYY');

const LOG_BUFFER_SIZE = 500;
const logBuffer = [];
const logEmitter = new EventEmitter();
logEmitter.setMaxListeners(100);

function pushToBuffer(entry) {
  logBuffer.push(entry);
  if (logBuffer.length > LOG_BUFFER_SIZE) logBuffer.shift();
  logEmitter.emit('log', entry);
}

const writeLog = (type, message) => {
  try {
    const date = moment().tz('Asia/Karachi').format('YYYY-MM-DD');
    const logFile = path.join(logDir, `${date}.log`);
    fs.appendFileSync(logFile, `[${getTime()} || ${getDate()}] [${type}] ${message}\n`);
  } catch (e) {}
};

const printBanner = () => {
  process.stdout.write('\n');
  process.stdout.write(chalk.hex('#FF4D4D').bold(' ╔══════════════════════════╗\n'));
  process.stdout.write(chalk.hex('#FF6B6B').bold(' ║  ★ MR DEVIL  MR DEVIL  BOT ★   ║\n'));
  process.stdout.write(chalk.hex('#FF8E8E').bold(' ║  ─────────────────────  ║\n'));
  process.stdout.write(chalk.hex('#FF4D4D').bold(' ║  MRDEVIL-FCA v2  |  Node.js ║\n'));
  process.stdout.write(chalk.hex('#FF2020').bold(' ╚══════════════════════════╝\n'));
  process.stdout.write('\n');
  process.stdout.write(chalk.green(' Dev   : ') + chalk.white.bold('MR DEVIL\n'));
  process.stdout.write('\n');
};

const logs = {
  banner: printBanner,

  getBuffer: () => [...logBuffer],
  emitter: logEmitter,

  info: (title, ...args) => {
    const msg = args.join(' ');
    process.stdout.write(`${chalk.gray(`[${getTime()}]`)} ${chalk.cyan.bold(`◈ ${title.toUpperCase()} ◈`)} ${chalk.white(msg)}\n`);
    writeLog('INFO', `[${title}] ${msg}`);
    pushToBuffer({ type: 'info', title, msg, time: getTime(), ts: Date.now() });
  },

  success: (title, ...args) => {
    const msg = args.join(' ');
    const colors = [chalk.cyanBright, chalk.magentaBright, chalk.yellowBright, chalk.blueBright, chalk.greenBright];
    const c = colors[Math.floor(Math.random() * colors.length)];
    process.stdout.write(`${chalk.gray(`[${getTime()}]`)} ${c.bold(`✔ ${title.toUpperCase()} ✔`)} ${c(msg)}\n`);
    writeLog('SUCCESS', `[${title}] ${msg}`);
    pushToBuffer({ type: 'success', title, msg, time: getTime(), ts: Date.now() });
  },

  error: (title, ...args) => {
    const msg = args.join(' ');
    process.stdout.write(`${chalk.gray(`[${getTime()}]`)} ${chalk.red.bold(`✘ ${title.toUpperCase()} ✘`)} ${chalk.redBright(msg)}\n`);
    writeLog('ERROR', `[${title}] ${msg}`);
    pushToBuffer({ type: 'error', title, msg, time: getTime(), ts: Date.now() });
  },

  warn: (title, ...args) => {
    const msg = args.join(' ');
    process.stdout.write(`${chalk.gray(`[${getTime()}]`)} ${chalk.yellow.bold(`⚠ ${title.toUpperCase()} ⚠`)} ${chalk.yellowBright(msg)}\n`);
    writeLog('WARN', `[${title}] ${msg}`);
    pushToBuffer({ type: 'warn', title, msg, time: getTime(), ts: Date.now() });
  },

  command: (name, user, threadID, client) => {
    if (!client) return;
    const exists = client.commands.has(name.toLowerCase()) ||
      Array.from(client.commands.values()).some(c => c.config?.aliases?.includes(name.toLowerCase()));
    if (!exists) return;
    process.stdout.write(
      `${chalk.gray(`[${getTime()}]`)} ` +
      `${chalk.blue.bold('⚡ CMD ⚡')} ` +
      `${chalk.cyan.bold(name)} ` +
      `${chalk.gray('by')} ${chalk.white.bold(user)} ` +
      `${chalk.gray('in')} ${chalk.blue(threadID)}\n`
    );
    writeLog('COMMAND', `${name} by ${user} in ${threadID}`);
    pushToBuffer({ type: 'command', title: 'CMD', msg: `${name} by ${user} in ${threadID}`, time: getTime(), ts: Date.now() });
  },

  event: (type, threadID) => {
    process.stdout.write(
      `${chalk.gray(`[${getTime()}]`)} ${chalk.magenta.bold('☄ EVENT ☄')} ` +
      `${chalk.white.bold(type)} ${chalk.gray('in')} ${chalk.blue(threadID)}\n`
    );
    writeLog('EVENT', `${type} in ${threadID}`);
    pushToBuffer({ type: 'event', title: 'EVENT', msg: `${type} in ${threadID}`, time: getTime(), ts: Date.now() });
  }
};

module.exports = logs;
