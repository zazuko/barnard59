const { template } = require('../utils')
const Issue = require('../issue')

const operationIsImportable = {
  ruleId: 14,
  ruleDescription: 'Operation defined in manifest can be imported',
  messageSuccessTemplate: template`${'filename'} can be imported for operation ${'op'}`,
  messageFailureTemplate: template`Cannot import ${'filename'} for operation ${'op'}`,
  async validate ({ op, filename }) {
    let issue = Issue.error({ id: this.ruleId, templateData: { op, filename } })

    try {
      await import(filename)
      issue = Issue.info({ id: this.ruleId, templateData: { op, filename } })
    }
    catch (err) { }

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
module.exports = operationIsImportable
