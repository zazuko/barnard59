const template = require('../template')
const Issue = require('../issue')

const readableObjectModeBeforeWritableObjectMode = {
  ruleId: 11,
  dependsOn: [8, 100],
  ruleDescription: 'WritableObjectMode operation must always be preceded by a ReadableObjectMode operation',
  messageSuccessTemplate: template`Validated operation ${'operation'}: a writableObjectMode operation must always be preceded by a readableObjectMode operation`,
  messageFailureTemplate: template`Invalid operation ${'operation'}: previous operation is not readableObjectMode`,
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
module.exports = readableObjectModeBeforeWritableObjectMode
