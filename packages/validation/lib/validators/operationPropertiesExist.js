const { template } = require('../utils')
const Issue = require('../issue')

const operationPropertiesExist = {
  ruleId: 7,
  ruleDescription: 'Operation has at least one property defined. Recognized choices: Readable, Writable, ReadableObjectMode, WritableObjectMode',
  messageSuccessTemplate: template`Validated: properties for operation ${'operation'} are defined`,
  messageFailureTemplate: template`Cannot validate operation ${'operation'}: no metadata`,
  validate (operationProperties, step, operation) {
    let issue
    if (operationProperties === null) {
      issue = Issue.warning({ id: this.ruleId, step, operation })
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
module.exports = operationPropertiesExist
