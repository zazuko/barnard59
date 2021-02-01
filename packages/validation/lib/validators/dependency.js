const Issue = require('../issue')
const utils = require('../utils')
const { template } = require('../utils')

const dependency = {
  ruleDescription: 'Each dependency must be installed',
  ruleId: 2668,
  messageSuccessTemplate: template`Package ${'library'} found successfully`,
  messageFailureTemplate: template`Missing package ${'library'}\n  The following operations cannot be validated:\n  * "${'operations'}"`,
  validate (library, codelinksWithMissingMetadata) {
    let issue
    if (utils.isModuleInstalled(library)) {
      issue = Issue.info({ id: this.ruleId, templateData: { library } })
    }
    else {
      issue = Issue.error({
        id: this.ruleId,
        templateData: { library, operations: codelinksWithMissingMetadata }
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
