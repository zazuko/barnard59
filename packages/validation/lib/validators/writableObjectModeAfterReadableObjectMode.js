import { template } from '../utils.js'
import Issue from '../issue.js'

export default {
  ruleId: 13,
  ruleDescription: 'ReadableObjectMode operation must be followed by a WritableObjectMode operation',
  messageSuccessTemplate: template`Validated operation ${'operation'}: a ReadableObjectMode operation must be followed by a WritableObjectMode operation`,
  messageFailureTemplate: template`Invalid operation ${'operation'}: next operation is not WritableObjectMode`,
  validate(isWritableObjectMode, step, operation) {
    let issue
    if (!isWritableObjectMode) {
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
