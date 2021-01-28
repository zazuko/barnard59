const template = require('../template')
const Issue = require('../issue')

const previousOperationHasMetadata = {
  ruleId: 100,
  dependsOn: [8],
  ruleDescription: 'Previous operation should have metadata',
  messageSuccessTemplate: template`Validation can be performed for operation ${'operation'}: previous operation has metadata`,
  messageFailureTemplate: template`Cannot validate operation ${'operation'}: previous operation does not have metadata`,
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
module.exports = previousOperationHasMetadata
