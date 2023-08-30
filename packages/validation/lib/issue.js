const chalk = require('chalk')

const colors = {
  info: chalk.grey,
  warning: chalk.yellow,
  error: chalk.red
}

const levelsTemplates = {
  info: 'messageSuccessTemplate',
  warning: 'messageFailureTemplate',
  error: 'messageFailureTemplate'
}

class Issue {
  constructor ({ step, operation, message, level, id, templateData } = {}) {
    this.id = id
    this.level = level
    this.operation = operation
    this.step = step
    this.message = message
    // extra metadata to be passed to the message template
    this.templateData = {}
    if (typeof templateData === 'object') {
      this.templateData = templateData
    }

    if (this.id) {
      const { rulesById } = require('./rules')
      const template = levelsTemplates[this.level]
      this.message = rulesById[this.id][template]({
        ...this.templateData,
        operation: this.operation
      })
    }
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

  static info ({ step, operation, message, id, templateData }) {
    return new Issue({ step, operation, message, id, templateData, level: 'info' })
  }

  static warning ({ step, operation, message, id, templateData }) {
    return new Issue({ step, operation, message, id, templateData, level: 'warning' })
  }

  static error ({ step, operation, message, id, templateData }) {
    return new Issue({ step, operation, message, id, templateData, level: 'error' })
  }
}

module.exports = Issue
