const { template } = require('../utils')
const Issue = require('../issue')

const firstOperationIsReadable = {
  ruleId: 9,
  ruleDescription: 'If there exists more than one step, first step must be either Readable or ReadableObjectMode',
  messageSuccessTemplate: template`Validated operation ${'operation'}: first operation must be either Readable or ReadableObjectMode`,
  messageFailureTemplate: template`Invalid operation ${'operation'}: it is neither Readable nor ReadableObjectMode`,
  validate (isReadableOrReadableObjectMode, step, operation) {
    let issue
    if (!isReadableOrReadableObjectMode) {
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
module.exports = firstOperationIsReadable
