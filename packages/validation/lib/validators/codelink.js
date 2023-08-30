const Issue = require('../issue')
const { template } = require('../utils')

const codelink = {
  ruleDescription: 'Each codelink is described by code.implementedBy/code.link',
  ruleId: 1337,
  messageSuccessTemplate: template`Defined with both code.implementedBy & code.link`,
  messageFailureTemplate: template`Missing code.implementedBy/code.link`,
  validate (implementedBy, codeLink, currStepName) {
    let issue
    if (implementedBy && codeLink) {
      issue = Issue.info({ id: this.ruleId, step: currStepName })
    }
    else {
      issue = Issue.error({ id: this.ruleId, step: currStepName })
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

module.exports = codelink
