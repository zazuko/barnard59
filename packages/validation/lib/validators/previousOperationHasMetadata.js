import { template } from '../utils.js'
import Issue from '../issue.js'

export default {
  ruleId: 100,
  ruleDescription: 'Previous operation should have metadata',
  messageSuccessTemplate: template`Validation can be performed for operation ${'operation'}: previous operation has metadata`,
  messageFailureTemplate: template`Cannot validate operation ${'operation'}: previous operation does not have metadata`,
  validate(lastOperationProperties, step, operation) {
    let issue
    if (lastOperationProperties === null) {
      issue = Issue.warning({ rule: this, step, operation })
    } else {
      issue = Issue.info({ rule: this, step, operation })
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
