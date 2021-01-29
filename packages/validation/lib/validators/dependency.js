const Issue = require('../issue')
const utils = require('../utils')
const template = require('../template')

const dependency = {
  ruleDescription: 'Each dependency must be installed',
  ruleId: 2668,
  messageSuccessTemplate: template`Package ${'library'} found successfully`,
  messageFailureTemplate: template`Missing package ${'library'}\n  The following operations cannot be validated:\n  * "${'operations'}"`,
  validate: (library, codelinksWithMissingMetadata) => {
    let issue
    if (utils.isModuleInstalled(library)) {
      issue = Issue.info({
        id: dependency.ruleId,
        message: dependency.messageSuccessTemplate({ library })
      })
    }
    else {
      issue = Issue.error({
        id: dependency.ruleId,
        message: dependency.messageFailureTemplate({ library, operations: codelinksWithMissingMetadata })
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
