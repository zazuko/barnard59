const template = require('../template')
const Issue = require('../issue')

const operationPropertiesExist = {
  ruleId: 7,
  dependsOn: [3],
  ruleDescription: 'Operation has at least one property defined. Recognzed choices: readable, writable, readableObjectMode, writableObjectMode',
  messageSuccessTemplate: template`Validated: properties for operation ${'operation'} are defined`,
  messageFailureTemplate: template`Cannot validate operation ${'operation'}: no metadata.`,
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
module.exports = operationPropertiesExist
