import { template } from '../utils.js'
import Issue from '../issue.js'

export default {
  ruleId: 9,
  ruleDescription: 'If there exists more than one step, first step must be either Readable or ReadableObjectMode',
  messageSuccessTemplate: template`Validated operation ${'operation'}: first operation must be either Readable or ReadableObjectMode`,
  messageFailureTemplate: template`Invalid operation ${'operation'}: it is neither Readable nor ReadableObjectMode`,
  validate(isReadableOrReadableObjectMode, step, operation) {
    let issue
    if (!isReadableOrReadableObjectMode) {
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
