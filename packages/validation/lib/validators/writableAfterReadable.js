const template = require('../template')
const Issue = require('../issue')

const writableAfterReadable = {
  ruleId: 12,
  ruleDescription: 'Readable operation must always be followed by a Writable operation',
  messageSuccessTemplate: template`Validated operation ${'operation'}: a Readable operation must always be followed by a Writable operation`,
  messageFailureTemplate: template`Invalid operation ${'operation'}: next operation is not Writable`,
  validate: (isWritable, step, operation) => {
    let issue
    if (!isWritable) {
      issue = Issue.error({
        id: writableAfterReadable.ruleId,
        message: writableAfterReadable.messageFailureTemplate({ operation }),
        step,
        operation
      })
    }
    else {
      issue = Issue.info({
        id: writableAfterReadable.ruleId,
        message: writableAfterReadable.messageSuccessTemplate({ operation }),
        step,
        operation
      })
    }
    return issue
  },
  describeRule: () => {
    return {
      ruleId: writableAfterReadable.ruleId,
      ruleDescription: writableAfterReadable.ruleDescription,
      messageSuccess: writableAfterReadable.messageSuccessTemplate(),
      messageFailure: writableAfterReadable.messageFailureTemplate()
    }
  }
}

module.exports = writableAfterReadable
