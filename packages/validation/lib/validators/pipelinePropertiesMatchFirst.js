const template = require('../template')
const Issue = require('../issue')

const pipelinePropertiesMatchFirst = {
  ruleId: 5,
  dependsOn: [3, 4],
  ruleDescription: 'Pipeline should have the same type if its first stream is writable(ObjecMode)',
  messageFailureTemplate: template`The pipeline ${'pipeline'} must be of type Writable or WritableObjectMode`,
  messageSuccessTemplate: template`The pipeline mode for ${'pipeline'} matches first stream`,
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
module.exports = pipelinePropertiesMatchFirst
