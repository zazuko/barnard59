const { template } = require('../utils')
const Issue = require('../issue')

const operationIsExported = {
  ruleId: 15,
  ruleDescription: 'Operation defined in manifest has a corresponding export',
  messageSuccessTemplate: template`File ${'filename'} exports '${'method'}' for operation ${'op'}`,
  messageFailureTemplate: template`File ${'filename'} does not export ${'method'} for operation ${'op'}`,
  async validate ({ op, filename, method }) {
    let issue
    try {
      const imported = await import(filename)

      if (typeof imported[method] !== 'function') {
        issue = Issue.error({ id: this.ruleId, templateData: { op, filename, method } })
      }
      else {
        issue = Issue.info({ id: this.ruleId, templateData: { op, filename, method } })
      }
    }
    catch (err) {
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
module.exports = operationIsExported
