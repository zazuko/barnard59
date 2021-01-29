const template = require('../template')
const Issue = require('../issue')

const readableBeforeWritable = {
  ruleId: 10,
  ruleDescription: 'Writable operation must always be preceded by a readable operation',
  messageSuccessTemplate: template`Validated operation ${'operation'}: a writable operation must always be preceded by a readable operation`,
  messageFailureTemplate: template`Invalid operation ${'operation'}: previous operation is not Readable`,
  validate: (lastIsReadable, step, operation) => {
    let issue
    if (!lastIsReadable) {
      issue = Issue.error({
        id: readableBeforeWritable.ruleId,
        message: readableBeforeWritable.messageFailureTemplate({ operation }),
        step,
        operation
      })
    }
    else {
      issue = Issue.info({
        id: readableBeforeWritable.ruleId,
        message: readableBeforeWritable.messageSuccessTemplate({ operation }),
        step,
        operation
      })
    }
    return issue
  },
  describeRule: () => {
    return {
      ruleId: readableBeforeWritable.ruleId,
      ruleDescription: readableBeforeWritable.ruleDescription,
      messageSuccess: readableBeforeWritable.messageSuccessTemplate(),
      messageFailure: readableBeforeWritable.messageFailureTemplate()
    }
  }
}
module.exports = readableBeforeWritable
