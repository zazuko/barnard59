const template = require('../template')
const Issue = require('../issue')

const pipelinePropertiesMatchFirst = {
  ruleId: 5,
  ruleDescription: 'Pipeline should have the same type if its first stream is Writable(ObjectMode)',
  messageFailureTemplate: template`The pipeline ${'pipeline'} must be of type Writable or WritableObjectMode`,
  messageSuccessTemplate: template`The pipeline mode for ${'pipeline'} matches first stream`,
  validate: (pipeline, pipelineProperties) => {
    let issue
    const pipelineIsOfRightType = pipelineProperties.includes('Writable') || pipelineProperties.includes('WritableObjectMode')
    if (!pipelineIsOfRightType) {
      issue = Issue.error({
        id: pipelinePropertiesMatchFirst.ruleId,
        message: pipelinePropertiesMatchFirst.messageFailureTemplate({ pipeline })
      })
    }
    else {
      issue = Issue.info({
        id: pipelinePropertiesMatchFirst.ruleId,
        message: pipelinePropertiesMatchFirst.messageSuccessTemplate({ pipeline })
      })
    }
    return issue
  },
  describeRule: () => {
    return {
      ruleId: pipelinePropertiesMatchFirst.ruleId,
      ruleDescription: pipelinePropertiesMatchFirst.ruleDescription,
      messageSuccess: pipelinePropertiesMatchFirst.messageSuccessTemplate(),
      messageFailure: pipelinePropertiesMatchFirst.messageFailureTemplate()
    }
  }
}
module.exports = pipelinePropertiesMatchFirst
