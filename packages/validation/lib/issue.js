const chalk = require('chalk')

const colors = {
  info: chalk.grey,
  warning: chalk.yellow,
  error: chalk.red
}

class Issue {
  constructor ({ step, operation, message, level } = {}) {
    this.step = step
    this.operation = operation
    this.message = message
    this.level = level
  }

  toString () {
    let msg = this.message
    if (this.step) {
      msg += ` at step <${this.step}>`
    }
    if (this.operation) {
      msg += ` (${this.operation})`
    }
    return colors[this.level](msg)
  }

  static info ({ step, operation, message }) {
    return new Issue({ step, operation, message, level: 'info' })
  }

  static warning ({ step, operation, message }) {
    return new Issue({ step, operation, message, level: 'warning' })
  }

  static error ({ step, operation, message }) {
    return new Issue({ step, operation, message, level: 'error' })
  }
}

module.exports = Issue
