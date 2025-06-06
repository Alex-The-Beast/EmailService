export class Logger {
  static logLevels = {
    ERROR: 0,
    WARN: 1,
    INFO: 2,
    DEBUG: 3,
  };

  constructor(level = "INFO") {
    this.level = Logger.logLevels[level] || Logger.logLevels.INFO;
  }

  error(message, ...args) {
    if (this.level >= Logger.logLevels.ERROR) {
      console.error(`[ERROR] ${message}`, ...args);
    }
  }

  warn(message, ...args) {
    if (this.level >= Logger.logLevels.WARN) {
      console.warn(`[WARN] ${message}`, ...args);
    }
  }

  info(message, ...args) {
    if (this.level >= Logger.logLevels.INFO) {
      console.log(`[INFO] ${message}`, ...args);
    }
  }

  debug(message, ...args) {
    if (this.level >= Logger.logLevels.DEBUG) {
      console.debug(`[DEBUG] ${message}`, ...args);
    }
  }
}
