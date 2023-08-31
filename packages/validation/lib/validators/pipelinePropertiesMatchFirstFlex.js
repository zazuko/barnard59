import { template } from '../utils.js'
import Issue from '../issue.js'

export default {
  ruleId: 51,
  ruleDescription: 'Pipeline should have the same type if its first stream is Writable(ObjectMode)',
  messageFailureTemplate: template`The pipeline ${'pipeline'} must be of type Writable or WritableObjectMode`,
  messageSuccessTemplate: template`The pipeline type for ${'pipeline'} matches first stream`,
  validate(pipeline, pipelineProperties) {
    let issue
    const pipelineIsOfRightType = pipelineProperties.includes('Writable') || pipelineProperties.includes('WritableObjectMode')
    if (!pipelineIsOfRightType) {
      issue = Issue.error({ rule: this, templateData: { pipeline } })
    } else {
      issue = Issue.info({ rule: this, templateData: { pipeline } })
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
