const { template } = require('../utils')
const Issue = require('../issue')

const acceptedPipelineProperties = ['Readable', 'ReadableObjectMode', 'Writable', 'WritableObjectMode']

const pipelinePropertiesExist = {
  ruleId: 4,
  ruleDescription: `Pipeline has at least one property defined. Recognized choices: ${acceptedPipelineProperties.join(', ')}`,
  messageSuccessTemplate: template`Validated: property for pipeline ${'pipeline'} is defined`,
  messageFailureTemplate: template`Cannot validate pipeline ${'pipeline'}: the pipeline mode (Readable(ObjectMode)/Writable(ObjectMode)) is not defined`,
  validate (pipeline, pipelineProperties) {
    let issue
    const hasDefinedMode = pipelineProperties.some(p => acceptedPipelineProperties.includes(p))
    if (!hasDefinedMode) {
      issue = Issue.warning({ id: this.ruleId, templateData: { pipeline } })
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

module.exports = pipelinePropertiesExist
