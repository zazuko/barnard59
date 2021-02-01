const { template } = require('../utils')
const Issue = require('../issue')

const operationHasOperationProperty = {
  ruleId: 8,
  ruleDescription: 'Operation has property "Operation"',
  messageSuccessTemplate: template`Validated: operation ${'operation'} is of type "Operation"`,
  messageFailureTemplate: template`Invalid operation: ${'operation'} is not of type "Operation"`,
  validate (isOperation, step, operation) {
    let issue
    if (!isOperation) {
      issue = Issue.error({ id: this.ruleId, step, operation })
    }
    else {
      issue = Issue.info({ id: this.ruleId, step, operation })
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
module.exports = operationHasOperationProperty
