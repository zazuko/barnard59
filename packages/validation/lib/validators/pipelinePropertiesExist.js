const { template } = require('../utils')
const Issue = require('../issue')

const acceptedPipelineProperties = ['Readable', 'ReadableObjectMode', 'Writable', 'WritableObjectMode']

const pipelinePropertiesExist = {
  ruleId: 4,
  ruleDescription: `Pipeline has at least one property defined. Recognized choices: ${acceptedPipelineProperties.join(', ')}`,
  messageSuccessTemplate: template`Validated: property for pipeline ${'pipeline'} is defined`,
  messageFailureTemplate: template`Cannot validate pipeline ${'pipeline'}: the pipeline mode (Readable(ObjectMode)/Writable(ObjectMode)) is not defined`,
  validate: (pipeline, pipelineProperties) => {
    let issue
    const hasDefinedMode = (pipelineProperties.some(p => acceptedPipelineProperties.includes(p)))
    if (!hasDefinedMode) {
      issue = Issue.warning({
        message: pipelinePropertiesExist.messageFailureTemplate({ pipeline })
      })
    }
    else {
      issue = Issue.info({
        message: pipelinePropertiesExist.messageSuccessTemplate({ pipeline })
      })
    }
    return issue
  },
  describeRule: () => {
    return {
      ruleId: pipelinePropertiesExist.ruleId,
      ruleDescription: pipelinePropertiesExist.ruleDescription,
      messageSuccess: pipelinePropertiesExist.messageSuccessTemplate(),
      messageFailure: pipelinePropertiesExist.messageFailureTemplate()
    }
  }
}

module.exports = pipelinePropertiesExist
