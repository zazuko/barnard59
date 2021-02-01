const { template } = require('../utils')
const Issue = require('../issue')

const readableBeforeWritable = {
  ruleId: 10,
  ruleDescription: 'Writable operation must always be preceded by a Readable operation',
  messageSuccessTemplate: template`Validated operation ${'operation'}: a Writable operation must always be preceded by a Readable operation`,
  messageFailureTemplate: template`Invalid operation ${'operation'}: previous operation is not Readable`,
  validate (lastIsReadable, step, operation) {
    let issue
    if (!lastIsReadable) {
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
module.exports = readableBeforeWritable
