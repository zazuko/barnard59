const chalk = require('chalk')

const colors = {
  info: chalk.grey,
  warning: chalk.yellow,
  error: chalk.red
}

class Issue {
  constructor ({ step, operation, message, level, id } = {}) {
    this.step = step
    this.operation = operation
    this.message = message
    this.level = level
    this.id = id
  }

  toString () {
    let msg = this.message
    if (this.step) {
      msg += ` [at step <${this.step}>]`
    }
    if (this.id) {
      return chalk.blue(`[${String(this.id).padStart(4, '0')}]  ` + colors[this.level](msg))
    }
    return colors[this.level](msg)
  }

  static info ({ step, operation, message, id }) {
    return new Issue({ step, operation, message, id, level: 'info' })
  }

  static warning ({ step, operation, message, id }) {
    return new Issue({ step, operation, message, id, level: 'warning' })
  }

  static error ({ step, operation, message, id }) {
    return new Issue({ step, operation, message, id, level: 'error' })
  }
}

module.exports = Issue
