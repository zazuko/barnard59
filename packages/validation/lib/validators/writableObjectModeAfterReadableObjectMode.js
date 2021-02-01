const { template } = require('../utils')
const Issue = require('../issue')

const writableObjectModeAfterReadableObjectMode = {
  ruleId: 13,
  ruleDescription: 'ReadableObjectMode operation must be followed by a WritableObjectMode operation',
  messageSuccessTemplate: template`Validated operation ${'operation'}: a ReadableObjectMode operation must be followed by a WritableObjectMode operation`,
  messageFailureTemplate: template`Invalid operation ${'operation'}: next operation is not WritableObjectMode`,
  validate: (isWritableObjectMode, step, operation) => {
    let issue
    if (!isWritableObjectMode) {
      issue = Issue.error({
        id: writableObjectModeAfterReadableObjectMode.ruleId,
        message: writableObjectModeAfterReadableObjectMode.messageFailureTemplate({ operation }),
        step,
        operation
      })
    }
    else {
      issue = Issue.info({
        id: writableObjectModeAfterReadableObjectMode.ruleId,
        message: writableObjectModeAfterReadableObjectMode.messageSuccessTemplate({ operation }),
        step,
        operation
      })
    }
    return issue
  },
  describeRule: () => {
    return {
      ruleId: writableObjectModeAfterReadableObjectMode.ruleId,
      ruleDescription: writableObjectModeAfterReadableObjectMode.ruleDescription,
      messageSuccess: writableObjectModeAfterReadableObjectMode.messageSuccessTemplate(),
      messageFailure: writableObjectModeAfterReadableObjectMode.messageFailureTemplate()
    }
  }
}
module.exports = writableObjectModeAfterReadableObjectMode
