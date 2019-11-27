import { DEBUG } from "../index";
export default class Logger {
  constructor(name, emoji = "🤑") {
    this.name = name;
    this.emoji = emoji;
  }

  log(level, ...args) {
    if (level === "INFO") {
      this.info(...args);
    } else if (level === "DEBUG") {
      this.debug(...args);
    } else if (level === "WARN") {
      this.warn(...args);
    } else if (level === "ERROR") {
      this.error(...args);
    }
  }

  debug(...args) {
    if (DEBUG) {
      console.log.apply(console, [`${this.emoji} [DEBUG] [${this.name}]`, ...args]);
    }
  }

  info(...args) {
    console.log.apply(console, [`${this.emoji} [%cINFO %c] [${this.name}]`, "color:lightblue", "color:unset", ...args]);
  }

  warn(...args) {
    console.warn.apply(console, [`${this.emoji} [WARN ] [${this.name}]`, ...args]);
  }

  error(...args) {
    console.error.apply(console, [`${this.emoji} [ERROR] [${this.name}]`, ...args]);
  }
}
