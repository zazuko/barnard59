const Issue = require('../issue')
const utils = require('../utils')
const template = require('../template')

const dependency = {
  ruleDescription: 'Each dependency must be installed',
  ruleId: 2668,
  messageSuccessTemplate: template`Package ${'package'} found successfully`,
  messageFailureTemplate: template`Missing package ${'package'}\n  The following operations cannot be validated:\n  * "${'operations'}"`,
  validate: (package, codelinksWithMissingMetadata) => {
    let issue
    if (utils.isModuleInstalled(package)) {
      issue = Issue.info({
        id: dependency.ruleId,
        message: dependency.messageSuccessTemplate({ package: package })
      })
    }
    else {
      issue = Issue.error({
        id: dependency.ruleId,
        message: dependency.messageFailureTemplate({ package: package, operations: codelinksWithMissingMetadata })
      })
    }
    return issue
  },
  describeRule: () => {
    return {
      ruleId: dependency.ruleId,
      ruleDescription: dependency.ruleDescription,
      messageSuccess: dependency.messageSuccessTemplate(),
      messageFailure: dependency.messageFailureTemplate()
    }
  }
}

module.exports = dependency
