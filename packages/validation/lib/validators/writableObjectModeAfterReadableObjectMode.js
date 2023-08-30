const { template } = require('../utils')
const Issue = require('../issue')

const writableObjectModeAfterReadableObjectMode = {
  ruleId: 13,
  ruleDescription: 'ReadableObjectMode operation must be followed by a WritableObjectMode operation',
  messageSuccessTemplate: template`Validated operation ${'operation'}: a ReadableObjectMode operation must be followed by a WritableObjectMode operation`,
  messageFailureTemplate: template`Invalid operation ${'operation'}: next operation is not WritableObjectMode`,
  validate (isWritableObjectMode, step, operation) {
    let issue
    if (!isWritableObjectMode) {
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
module.exports = writableObjectModeAfterReadableObjectMode
