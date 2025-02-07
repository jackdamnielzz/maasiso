const LOG_LEVELS = {
  NONE: 0,
  ERROR: 1,
  WARN: 2,
  INFO: 3,
  DEBUG: 4,
};

const DEBUG = process.env.DEBUG === 'true';
const currentLogLevel = DEBUG ? LOG_LEVELS.DEBUG : LOG_LEVELS.WARN;

function getTimestamp() {
  return new Date().toISOString();
}

function log(level, ...args) {
  if (LOG_LEVELS[level] <= currentLogLevel) {
    console.log(`[${getTimestamp()}] [${level}]`, ...args);
  }
}

const logger = {
  error: (...args) => log('ERROR', ...args),
  warn: (...args) => log('WARN', ...args),
  info: (...args) => DEBUG && log('INFO', ...args),
  debug: (...args) => DEBUG && log('DEBUG', ...args),
};

module.exports = logger;