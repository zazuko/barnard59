const template = require('../template')
const Issue = require('../issue')

const operationHasOperationProperty = {
  ruleId: 8,
  ruleDescription: 'Operation has property "Operation"',
  messageSuccessTemplate: template`Validated: operation ${'operation'} is of "Operation" type.`,
  messageFailureTemplate: template`Invalid operation: ${'operation'} is not of "Operation" type.`,
  validate: (isOperation, step, operation) => {
    let issue
    if (!isOperation) {
      issue = Issue.error({
        id: operationHasOperationProperty.ruleId,
        message: operationHasOperationProperty.messageFailureTemplate({ operation }),
        step,
        operation
      })
    }
    else {
      issue = Issue.info({
        id: operationHasOperationProperty.ruleId,
        message: operationHasOperationProperty.messageSuccessTemplate({ operation }),
        step,
        operation
      })
    }
    return issue
  },
  describeRule: () => {
    return {
      ruleId: operationHasOperationProperty.ruleId,
      ruleDescription: operationHasOperationProperty.ruleDescription,
      messageSuccess: operationHasOperationProperty.messageSuccessTemplate(),
      messageFailure: operationHasOperationProperty.messageFailureTemplate()
    }
  }
}
module.exports = operationHasOperationProperty
