import { template } from '../utils.js'
import Issue from '../issue.js'

export default {
  ruleId: 12,
  ruleDescription: 'Readable operation must always be followed by a Writable operation',
  messageSuccessTemplate: template`Validated operation ${'operation'}: a Readable operation must always be followed by a Writable operation`,
  messageFailureTemplate: template`Invalid operation ${'operation'}: next operation is not Writable`,
  validate(isWritable, step, operation) {
    let issue
    if (!isWritable) {
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
