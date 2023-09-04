import { template } from '../utils.js'
import Issue from '../issue.js'

export default {
  ruleId: 61,
  ruleDescription: 'Pipeline should have the same type if its last stream is Readable(ObjectMode)',
  messageFailureTemplate: template`The pipeline ${'pipeline'} must be of type Readable or ReadableObjectMode`,
  messageSuccessTemplate: template`The pipeline type for ${'pipeline'} matches last stream`,
  validate(pipeline, pipelineProperties) {
    let issue
    const pipelineIsOfRightType = pipelineProperties.includes('Readable') || pipelineProperties.includes('ReadableObjectMode')
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
