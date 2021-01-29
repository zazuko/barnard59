const validators = require('./validators')

function validatePipelineProperty (pipeline, pipelineProperties, opProperties, mode, checks) {
  const canStreamBeWritable = opProperties.includes('Writable') || opProperties.includes('WritableObjectMode')
  const canStreamBeReadable = opProperties.includes('Readable') || opProperties.includes('ReadableObjectMode')

  let issue
  if (mode === 'first') {
    const isStreamWritableOnly = canStreamBeWritable && !canStreamBeReadable
    if (isStreamWritableOnly) {
      issue = validators.pipelinePropertiesMatchFirst.validate(pipeline, pipelineProperties)
      checks.addPipelineCheck(issue, pipeline)
    }
  }

  if (mode === 'last') {
    const isStreamReadableOnly = canStreamBeReadable && !canStreamBeWritable
    if (isStreamReadableOnly) {
      issue = validators.pipelinePropertiesMatchLast.validate(pipeline, pipelineProperties)
      checks.addPipelineCheck(issue, pipeline)
    }
  }
}

module.exports = validatePipelineProperty
