const template = require('../template')
const Issue = require('../issue')

const operation = {
  ruleId: 3,
  ruleDescription: 'Manifest.ttl file exists and can be parsed',
  messageSuccessTemplate: template`Metadata file for ${'package'} loaded successfully`,
  messageFailureTemplate: template`Missing metadata file for ${'package'}.\n  The following operations cannot be validated:\n  * "${'operations'}"`,
  validate: (operationPathExists, module, codelinksWithMissingMetadata) => {
    let issue
    if (operationPathExists) {
      issue = Issue.info({
        id: operation.ruleId,
        message: operation.messageSuccessTemplate({ package: module })
      })
    }
    else {
      issue = Issue.warning({
        id: operation.ruleId,
        message: operation.messageFailureTemplate({ package: module, operation: codelinksWithMissingMetadata })
      })
    }
    return issue
  },
  describeRule: () => {
    return {
      ruleId: operation.ruleId,
      ruleDescription: operation.ruleDescription,
      messageSuccess: operation.messageSuccessTemplate(),
      messageFailure: operation.messageFailureTemplate()
    }
  }
}

module.exports = operation