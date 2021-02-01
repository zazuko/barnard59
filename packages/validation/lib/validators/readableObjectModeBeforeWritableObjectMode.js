const template = require('../template')
const Issue = require('../issue')

const readableObjectModeBeforeWritableObjectMode = {
  ruleId: 11,
  ruleDescription: 'WritableObjectMode operation must always be preceded by a ReadableObjectMode operation',
  messageSuccessTemplate: template`Validated operation ${'operation'}: a WritableObjectMode operation must always be preceded by a ReadableObjectMode operation`,
  messageFailureTemplate: template`Invalid operation ${'operation'}: previous operation is not ReadableObjectMode`,
  validate: (lastIsReadableObjectMode, step, operation) => {
    let issue
    if (!lastIsReadableObjectMode) {
      issue = Issue.error({
        id: readableObjectModeBeforeWritableObjectMode.ruleId,
        message: readableObjectModeBeforeWritableObjectMode.messageFailureTemplate({ operation }),
        step,
        operation
      })
    }
    else {
      issue = Issue.info({
        id: readableObjectModeBeforeWritableObjectMode.ruleId,
        message: readableObjectModeBeforeWritableObjectMode.messageSuccessTemplate({ operation }),
        step,
        operation
      })
    }
    return issue
  },
  describeRule: () => {
    return {
      ruleId: readableObjectModeBeforeWritableObjectMode.ruleId,
      ruleDescription: readableObjectModeBeforeWritableObjectMode.ruleDescription,
      messageSuccess: readableObjectModeBeforeWritableObjectMode.messageSuccessTemplate(),
      messageFailure: readableObjectModeBeforeWritableObjectMode.messageFailureTemplate()
    }
  }
}
module.exports = readableObjectModeBeforeWritableObjectMode
