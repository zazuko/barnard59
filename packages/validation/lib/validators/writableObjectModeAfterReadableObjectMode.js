const template = require('../template')
const Issue = require('../issue')

const writableObjectModeAfterReadableObjectMode = {
  ruleId: 13,
  dependsOn: [8, 100],
  ruleDescription: 'ReadableObjectMode operation must always be followed by a writableObjectMode operation',
  messageSuccessTemplate: template`Validated operation ${'operation'}: a readableObjectMode operation must always be followed by a writableObjectMode operation`,
  messageFailureTemplate: template`Invalid operation ${'operation'}: next operation is not writableObjectMode`,
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
module.exports = writableObjectModeAfterReadableObjectMode
