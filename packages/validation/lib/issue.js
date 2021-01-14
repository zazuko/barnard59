const chalk = require('chalk')

const colors = {
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
    return colors[this.level](this.message)
  }

  static warning ({ step, operation, message }) {
    return new Issue({ step, operation, message, level: 'warning' })
  }

  static error ({ step, operation, message }) {
    return new Issue({ step, operation, message, level: 'error' })
  }
}

module.exports = Issue
