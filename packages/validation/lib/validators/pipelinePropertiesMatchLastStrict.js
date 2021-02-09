const { template } = require('../utils')
const Issue = require('../issue')

const pipelinePropertiesMatchLastStrict = {
  ruleId: 6,
  ruleDescription: 'Pipeline should have the same type and mode if its last stream is Readable(ObjectMode)',
  messageFailureTemplate: template`The pipeline ${'pipeline'} must be of type ${'type'}`,
  messageSuccessTemplate: template`The pipeline type for ${'pipeline'} matches last stream`,
  validate (pipeline, pipelineProperties, type) {
    let issue
    const pipelineIsOfRightType = pipelineProperties.includes(type)
    if (!pipelineIsOfRightType) {
      issue = Issue.error({ id: this.ruleId, templateData: { pipeline, type } })
    }
    else {
      issue = Issue.info({ id: this.ruleId, templateData: { pipeline } })
    }
    return issue
  },
  describeRule () {
    return {
      ruleId: this.ruleId,
      ruleDescription: this.ruleDescription,
      messageSuccess: this.messageSuccessTemplate(),
      messageFailure: this.messageFailureTemplate()
    }
  }
}
module.exports = pipelinePropertiesMatchLastStrict
