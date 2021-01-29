const template = require('../template')
const Issue = require('../issue')

const writableObjectModeAfterReadableObjectMode = {
  ruleId: 13,
  ruleDescription: 'ReadableObjectMode operation must always be followed by a writableObjectMode operation',
  messageSuccessTemplate: template`Validated operation ${'operation'}: a readableObjectMode operation must always be followed by a writableObjectMode operation`,
  messageFailureTemplate: template`Invalid operation ${'operation'}: next operation is not writableObjectMode`,
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
