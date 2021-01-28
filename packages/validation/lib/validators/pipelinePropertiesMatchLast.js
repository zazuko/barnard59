const template = require('../template')
const Issue = require('../issue')

const pipelinePropertiesMatchLast = {
  ruleId: 6,
  dependsOn: [3, 4],
  ruleDescription: 'Pipeline should have the same type if its last stream is readable(ObjecMode)',
  messageFailureTemplate: template`The pipeline ${'pipeline'} must be of type Readable or ReadableObjectMode`,
  messageSuccessTemplate: template`The pipeline mode for ${'pipeline'} matches last stream`,
  validate: () => {
    let issue
    return issue
  },
  describeRule: () => {
    return {
      ruleId: this.ruleId,
      ruleDescription: this.ruleDescription,
      messageSuccess: this.messageSuccessTemplate(),
      messageFailure: this.messageFailureTemplate()
    }
  }
}
module.exports = pipelinePropertiesMatchLast
