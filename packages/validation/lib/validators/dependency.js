const Issue = require('../issue')
const { isModuleInstalled, template } = require('../utils')
const { dependencyTypes } = require('../config')

const dependency = {
  ruleDescription: 'Each dependency must be installed',
  ruleId: 2668,
  messageSuccessTemplate: template`Found ${'dependencyType'} ${'library'} successfully`,
  messageFailureTemplate: template`Missing ${'dependencyType'} ${'library'}\n  The following operations cannot be validated:\n  * "${'operations'}"`,
  validate (library, { operations, protocol }) {
    const dependencyType = dependencyTypes[protocol]
    let issue
    if (isModuleInstalled(library)) {
      issue = Issue.info({ id: this.ruleId, templateData: { library, dependencyType } })
    }
    else {
      issue = Issue.error({
        id: this.ruleId,
        templateData: { library, dependencyType, operations }
      })
    }
    return issue
  },
  describeRule () {
    return {
      ruleId: this.ruleId,
      ruleDescription: this.ruleDescription,
      messageSuccess: this.messageSuccessTemplate(),
      messageFailure: this.messageFailureTemplate()
    }
  }
}

module.exports = dependency
