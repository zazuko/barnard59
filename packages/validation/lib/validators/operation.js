import { template } from '../utils.js'
import Issue from '../issue.js'

export default {
  ruleId: 3,
  ruleDescription: 'manifest.ttl file exists and can be parsed',
  messageSuccessTemplate: template`Manifest file for ${'library'} loaded successfully`,
  messageFailureTemplate: template`Missing manifest file for ${'library'}\n  The following operations cannot be validated:\n  * "${'operations'}"`,
  validate(operationPathExists, library, codelinksWithMissingMetadata) {
    let issue
    if (operationPathExists) {
      issue = Issue.info({ rule: this, templateData: { library } })
    } else {
      issue = Issue.warning({
        rule: this,
        templateData: { library, operations: codelinksWithMissingMetadata },
      })
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
