import { template } from '../utils.js'
import Issue from '../issue.js'

export default {
  ruleId: 10,
  ruleDescription: 'Writable operation must always be preceded by a Readable operation',
  messageSuccessTemplate: template`Validated operation ${'operation'}: a Writable operation must always be preceded by a Readable operation`,
  messageFailureTemplate: template`Invalid operation ${'operation'}: previous operation is not Readable`,
  validate(lastIsReadable, step, operation) {
    let issue
    if (!lastIsReadable) {
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
