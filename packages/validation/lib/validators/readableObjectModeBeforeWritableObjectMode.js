const { template } = require('../utils')
const Issue = require('../issue')

const readableObjectModeBeforeWritableObjectMode = {
  ruleId: 11,
  ruleDescription: 'WritableObjectMode operation must always be preceded by a ReadableObjectMode operation',
  messageSuccessTemplate: template`Validated operation ${'operation'}: a WritableObjectMode operation must always be preceded by a ReadableObjectMode operation`,
  messageFailureTemplate: template`Invalid operation ${'operation'}: previous operation is not ReadableObjectMode`,
  validate (lastIsReadableObjectMode, step, operation) {
    let issue
    if (!lastIsReadableObjectMode) {
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
module.exports = readableObjectModeBeforeWritableObjectMode
