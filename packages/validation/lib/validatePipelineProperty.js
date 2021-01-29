const Issue = require('../lib/issue')
const rules = require('./schema')
const validators = require('./validators')

function validatePipelineProperty (pipeline, pipelineProperties, opProperties, mode, checks) {
  const canStreamBeWritable = opProperties.includes('Writable') || opProperties.includes('WritableObjectMode')
  const canStreamBeReadable = opProperties.includes('Readable') || opProperties.includes('ReadableObjectMode')

  let issue
  if (mode === 'first') {
    const isStreamWritableOnly = canStreamBeWritable && !canStreamBeReadable
    if (isStreamWritableOnly) {
      validators.pipelinePropertiesMatchFirst.validate(pipeline, pipelineProperties)
      // const pipelineIsOfRightType = pipelineProperties.includes('Writable') || pipelineProperties.includes('WritableObjectMode')
      // if (!pipelineIsOfRightType) {
      //  issue = Issue.error({ message: rules.pipelinePropertiesMatchFirst.messageFailure(pipeline) })
      // }
      // else {
      //  issue = Issue.info({ message: rules.pipelinePropertiesMatchFirst.messageSuccess(pipeline) })
      // }
      checks.addPipelineCheck(issue, pipeline)
    }
  }

  if (mode === 'last') {
    const isStreamReadableOnly = canStreamBeReadable && !canStreamBeWritable
    if (isStreamReadableOnly) {
      const pipelineIsOfRightType = pipelineProperties.includes('Readable') || pipelineProperties.includes('ReadableObjectMode')
      if (!pipelineIsOfRightType) {
        issue = Issue.error({ message: rules.pipelinePropertiesMatchLast.messageFailure(pipeline) })
      }
      else {
        issue = Issue.info({ message: rules.pipelinePropertiesMatchLast.messageSuccess(pipeline) })
      }
      checks.addPipelineCheck(issue, pipeline)
    }
  }
}

module.exports = validatePipelineProperty
