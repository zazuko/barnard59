const Issue = require('../issue')
const { template } = require('../utils')

const codelink = {
  ruleDescription: 'Each codelink is described by code.implementedBy/code.link',
  ruleId: 1337,
  messageSuccessTemplate: template`Defined with both code.implementedBy & code.link`,
  messageFailureTemplate: template`Missing code.implementedBy/code.link`,
  validate: (implementedBy, codeLink, currStepName) => {
    let issue
    if (implementedBy && codeLink) {
      issue = Issue.info({
        id: codelink.ruleId,
        message: codelink.messageSuccessTemplate(),
        step: currStepName
      })
    }
    else {
      issue = Issue.error({
        id: codelink.ruleId,
        message: codelink.messageFailureTemplate(),
        step: currStepName
      })
    }
    return issue
  },
  describeRule: () => {
    return {
      ruleId: codelink.ruleId,
      ruleDescription: codelink.ruleDescription,
      messageSuccess: codelink.messageSuccessTemplate(),
      messageFailure: codelink.messageFailureTemplate()
    }
  }
}

module.exports = codelink
