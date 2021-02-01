const { template } = require('../utils')
const Issue = require('../issue')

const writableAfterReadable = {
  ruleId: 12,
  ruleDescription: 'Readable operation must always be followed by a Writable operation',
  messageSuccessTemplate: template`Validated operation ${'operation'}: a Readable operation must always be followed by a Writable operation`,
  messageFailureTemplate: template`Invalid operation ${'operation'}: next operation is not Writable`,
  validate (isWritable, step, operation) {
    let issue
    if (!isWritable) {
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

module.exports = writableAfterReadable
