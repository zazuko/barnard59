const template = require('../template')
const Issue = require('../issue')

const operationHasOperationProperty = {
  ruleId: 8,
  dependsOn: [7],
  ruleDescription: 'Operation has property "Operation"',
  messageSuccessTemplate: template`Validated: operation ${'operation'} is of "Operation" type.`,
  messageFailureTemplate: template`Invalid operation: ${'operation'} is not of "Operation" type.`,
  validate: () => {
    let issue
    return issue
  },
  describeRule: () => {
    return {
      ruleId: this.ruleId,
      ruleDescription: this.ruleDescription,
      messageSuccess: this.messageSuccessTemplate(),
      messageFailure: this.messageFailureTemplate()
    }
  }
}
module.exports = operationHasOperationProperty
