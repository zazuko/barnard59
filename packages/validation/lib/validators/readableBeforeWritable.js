const template = require('../template')
const Issue = require('../issue')

const readableBeforeWritable = {
  ruleId: 10,
  dependsOn: [8, 100],
  ruleDescription: 'Writable operation must always be preceded by a readable operation',
  messageSuccessTemplate: template`Validated operation ${'operation'}: a writable operation must always be preceded by a readable operation`,
  messageFailureTemplate: template`Invalid operation ${'operation'}: previous operation is not Readable`,
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
module.exports = readableBeforeWritable
