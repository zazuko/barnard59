const template = require('../template')
const Issue = require('../issue')

const firstOperationIsReadable = {
  ruleId: 9,
  dependsOn: [8],
  ruleDescription: 'If there exists more than one step, first step must be either Readable or ReadableObjectMode',
  messageSuccessTemplate: template`Validated operation ${'operation'}: first operation must be either Readable or ReadableObjectMode`,
  messageFailureTemplate: template`Invalid operation ${'operation'}: it is neither Readable or ReadableObjectMode`,
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
module.exports = firstOperationIsReadable
