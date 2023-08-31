import { template } from '../utils.js'
import Issue from '../issue.js'

export default {
  ruleId: 8,
  ruleDescription: 'Operation has property "Operation"',
  messageSuccessTemplate: template`Validated: operation ${'operation'} is of type "Operation"`,
  messageFailureTemplate: template`Invalid operation: ${'operation'} is not of type "Operation"`,
  validate(isOperation, step, operation) {
    let issue
    if (!isOperation) {
      issue = Issue.error({ rule: this, step, operation })
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
