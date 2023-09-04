import Issue from '../issue.js'
import { template } from '../utils.js'

export default {
  ruleDescription: 'Each codelink is described by code.implementedBy/code.link',
  ruleId: 1337,
  messageSuccessTemplate: template`Defined with both code.implementedBy & code.link`,
  messageFailureTemplate: template`Missing code.implementedBy/code.link`,
  validate(implementedBy, codeLink, currStepName) {
    let issue
    if (implementedBy && codeLink) {
      issue = Issue.info({ rule: this, step: currStepName })
    } else {
      issue = Issue.error({ rule: this, step: currStepName })
    }
    return issue
  },
  describeRule() {
    return {
      ruleId: this.ruleId,
      ruleDescription: this.ruleDescription,
      messageSuccess: this.messageSuccessTemplate(),
      messageFailure: this.messageFailureTemplate(),
    }
  },
}
