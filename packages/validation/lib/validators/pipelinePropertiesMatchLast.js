const template = require('../template')
const Issue = require('../issue')

const pipelinePropertiesMatchLast = {
  ruleId: 6,
  ruleDescription: 'Pipeline should have the same type if its last stream is Readable(ObjectMode)',
  messageFailureTemplate: template`The pipeline ${'pipeline'} must be of type Readable or ReadableObjectMode`,
  messageSuccessTemplate: template`The pipeline mode for ${'pipeline'} matches last stream`,
  validate: (pipeline, pipelineProperties) => {
    let issue
    const pipelineIsOfRightType = pipelineProperties.includes('Readable') || pipelineProperties.includes('ReadableObjectMode')
    if (!pipelineIsOfRightType) {
      issue = Issue.error({
        id: pipelinePropertiesMatchLast.ruleId,
        message: pipelinePropertiesMatchLast.messageFailureTemplate({ pipeline })
      })
    }
    else {
      issue = Issue.info({
        id: pipelinePropertiesMatchLast.ruleId,
        message: pipelinePropertiesMatchLast.messageSuccessTemplate({ pipeline })
      })
    }
    return issue
  },
  describeRule: () => {
    return {
      ruleId: pipelinePropertiesMatchLast.ruleId,
      ruleDescription: pipelinePropertiesMatchLast.ruleDescription,
      messageSuccess: pipelinePropertiesMatchLast.messageSuccessTemplate(),
      messageFailure: pipelinePropertiesMatchLast.messageFailureTemplate()
    }
  }
}
module.exports = pipelinePropertiesMatchLast
