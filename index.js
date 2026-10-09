const { spawn } = require('child_process');
const chalk = require('chalk');
const moment = require('moment-timezone');

const BOT_SCRIPT = 'bot.js';
const RESTART_DELAY = 2000;
const MAX_RESTARTS_FAST = 10;
const FAST_RESTART_WINDOW = 60000;
let restartCount = 0;
let lastRestartTime = Date.now();

function getTime() {
  return moment().tz('Asia/Karachi').format('hh:mm:ss A');
}

function log(type, msg) {
  const t = getTime();
  const map = {
    INFO: () => console.log(chalk.cyan(`[${t}] [INFO] `) + chalk.white(msg)),
    SUCCESS: () => console.log(chalk.green(`[${t}] [OK]   `) + chalk.white(msg)),
    WARN: () => console.log(chalk.yellow(`[${t}] [WARN] `) + chalk.yellow(msg)),
    ERROR: () => console.log(chalk.red(`[${t}] [ERR]  `) + chalk.red(msg)),
    SYSTEM: () => console.log(chalk.magenta(`[${t}] [SYS]  `) + chalk.white(msg)),
  };
  (map[type] || map.INFO)();
}

function showBanner() {
  console.clear();
  console.log(chalk.hex('#FF4D4D').bold(' ╔══════════════════════════╗'));
  console.log(chalk.hex('#FF6B6B').bold(' ║   ★  MR  DEVIL  BOT  ★   ║'));
  console.log(chalk.hex('#FF8E8E').bold(' ║    Messenger Bot  v2     ║'));
  console.log(chalk.hex('#FF4D4D').bold(' ╚══════════════════════════╝'));
  console.log(chalk.gray(' Platform : ') + chalk.white(`${process.platform} / ${process.arch}`));
  console.log(chalk.gray(' Node     : ') + chalk.white(process.version));
  console.log(chalk.gray(' FCA      : ') + chalk.white('Mrdevilfca'));
  console.log('');
}

function start() {
  if (Date.now() - lastRestartTime > FAST_RESTART_WINDOW) restartCount = 0;
  lastRestartTime = Date.now();
  log('SYSTEM', 'Starting bot process...');

  const child = spawn('node', [BOT_SCRIPT], { stdio: 'inherit', shell: true, cwd: __dirname });
  child.on('error', (e) => log('ERROR', 'Spawn failed: ' + e.message));
  child.on('close', (code) => {
    if (code === null) { log('WARN', 'Bot killed by signal.'); process.exit(0); }
    if (code === 0) { log('SUCCESS', 'Bot stopped cleanly.'); process.exit(0); }
    restartCount++;
    if (restartCount > MAX_RESTARTS_FAST) {
      log('ERROR', `Too many restarts (${restartCount}). Pausing 30s...`);
      return setTimeout(start, 30000);
    }
    log('WARN', `Bot exited (${code}). Restarting in ${RESTART_DELAY / 1000}s...`);
    setTimeout(start, RESTART_DELAY);
  });
}

showBanner();
log('INFO', 'MR DEVIL BOT launcher ready');
start();
