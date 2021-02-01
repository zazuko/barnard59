const { template } = require('../utils')
const Issue = require('../issue')

const operation = {
  ruleId: 3,
  ruleDescription: 'manifest.ttl file exists and can be parsed',
  messageSuccessTemplate: template`Metadata file for ${'library'} loaded successfully`,
  messageFailureTemplate: template`Missing metadata file for ${'library'}.\n  The following operations cannot be validated:\n  * "${'operations'}"`,
  validate: (operationPathExists, library, codelinksWithMissingMetadata) => {
    let issue
    if (operationPathExists) {
      issue = Issue.info({
        id: operation.ruleId,
        message: operation.messageSuccessTemplate({ library })
      })
    }
    else {
      issue = Issue.warning({
        id: operation.ruleId,
        message: operation.messageFailureTemplate({ library, operations: codelinksWithMissingMetadata })
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
