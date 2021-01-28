const template = require('../template')
const Issue = require('../issue')

const writableAfterReadable = {
  ruleId: 12,
  dependsOn: [8, 100],
  ruleDescription: 'Readable operation must always be followed by a writable operation',
  messageSuccessTemplate: template`Validated operation ${'operation'}: a readable operation must always be followed by a writable operation`,
  messageFailureTemplate: template`Invalid operation ${'operation'}: next operation is not writable`,
  validate: () => {
    let issue
    return issue
  },
  describeRule: () => {
    return {
      ruleId: this.ruleId,
      ruleDescription: this.ruleDescription,
      messageSuccess: this.messageSuccessTemplate(),
      messageFailure: this.messageFailureTemplate()
    }
  }
}

module.exports = writableAfterReadable
