const template = require('../template')
const Issue = require('../issue')

const operationPropertiesExist = {
  ruleId: 7,
  ruleDescription: 'Operation has at least one property defined. Recognized choices: Readable, Writable, ReadableObjectMode, WritableObjectMode',
  messageSuccessTemplate: template`Validated: properties for operation ${'operation'} are defined`,
  messageFailureTemplate: template`Cannot validate operation ${'operation'}: no metadata`,
  validate: (operationProperties, step, operation) => {
    let issue
    if (operationProperties === null) {
      issue = Issue.warning({
        id: operationPropertiesExist.ruleId,
        message: operationPropertiesExist.messageFailureTemplate({ operation }),
        step,
        operation
      })
    }
    else {
      issue = Issue.info({
        id: operationPropertiesExist.ruleId,
        message: operationPropertiesExist.messageSuccessTemplate({ operation }),
        step,
        operation
      })
    }
    return issue
  },
  describeRule: () => {
    return {
      ruleId: operationPropertiesExist.ruleId,
      ruleDescription: operationPropertiesExist.ruleDescription,
      messageSuccess: operationPropertiesExist.messageSuccessTemplate(),
      messageFailure: operationPropertiesExist.messageFailureTemplate()
    }
  }
}
module.exports = operationPropertiesExist
