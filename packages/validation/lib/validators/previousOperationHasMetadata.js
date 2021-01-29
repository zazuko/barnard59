const template = require('../template')
const Issue = require('../issue')

const previousOperationHasMetadata = {
  ruleId: 100,
  ruleDescription: 'Previous operation should have metadata',
  messageSuccessTemplate: template`Validation can be performed for operation ${'operation'}: previous operation has metadata`,
  messageFailureTemplate: template`Cannot validate operation ${'operation'}: previous operation does not have metadata`,
  validate: (lastOperationProperties, step, operation) => {
    let issue
    if (lastOperationProperties === null) {
      issue = Issue.warning({
        id: previousOperationHasMetadata.ruleId,
        message: previousOperationHasMetadata.messageFailureTemplate({ operation }),
        step,
        operation
      })
    }
    else {
      issue = Issue.info({
        id: previousOperationHasMetadata.ruleId,
        message: previousOperationHasMetadata.messageSuccessTemplate({ operation }),
        step,
        operation
      })
    }
    return issue
  },
  describeRule: () => {
    return {
      ruleId: previousOperationHasMetadata.ruleId,
      ruleDescription: previousOperationHasMetadata.ruleDescription,
      messageSuccess: previousOperationHasMetadata.messageSuccessTemplate(),
      messageFailure: previousOperationHasMetadata.messageFailureTemplate()
    }
  }
}
module.exports = previousOperationHasMetadata
