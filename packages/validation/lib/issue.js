import chalk from 'chalk'

const colors = {
  info: chalk.grey,
  warning: chalk.yellow,
  error: chalk.red,
}

const levelsTemplates = {
  info: 'messageSuccessTemplate',
  warning: 'messageFailureTemplate',
  error: 'messageFailureTemplate',
}

export default class Issue {
  constructor({ step, operation, message, level, rule, templateData } = {}) {
    this.id = rule?.ruleId
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
      const template = levelsTemplates[this.level]
      this.message = rule[template]({
        ...this.templateData,
        operation: this.operation,
      })
    }
  }

  toString() {
    let msg = this.message
    if (this.step) {
      msg += ` [at step <${this.step}>]`
    }
    if (this.id) {
      return chalk.blue(`[${String(this.id).padStart(4, '0')}]  ` + colors[this.level](msg))
    }
    return colors[this.level](msg)
  }

  static info({ step, operation, message, rule, templateData }) {
    return new Issue({ step, operation, message, rule, templateData, level: 'info' })
  }

  static warning({ step, operation, message, rule, templateData }) {
    return new Issue({ step, operation, message, rule, templateData, level: 'warning' })
  }

  static error({ step, operation, message, rule, templateData }) {
    return new Issue({ step, operation, message, rule, templateData, level: 'error' })
  }
}
