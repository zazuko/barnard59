const validators = require('./validators')

function validatePipelineProperty (pipeline, pipelineProperties, opProperties, mode, checks) {
  const canBeWritable = opProperties.includes('Writable')
  const canBeReadable = opProperties.includes('Readable')
  const canBeWritableObjectMode = opProperties.includes('WritableObjectMode')
  const canBeReadableObjectMode = opProperties.includes('ReadableObjectMode')

  let issue
  if (mode === 'first') {
    const isWritableOnly = canBeWritable && !canBeWritableObjectMode && !canBeReadable && !canBeReadableObjectMode
    const isWritableObjectModeOnly = canBeWritableObjectMode && !canBeWritable && !canBeReadable && !canBeReadableObjectMode
    const isWritableOrWritableObjectMode = canBeWritable && canBeWritableObjectMode && !canBeReadable && !canBeReadableObjectMode

    if (isWritableOnly) {
      issue = validators.pipelinePropertiesMatchFirstStrict.validate(pipeline, pipelineProperties, 'Writable')
      checks.addPipelineCheck(issue, pipeline)
    }
    else if (isWritableObjectModeOnly) {
      issue = validators.pipelinePropertiesMatchFirstStrict.validate(pipeline, pipelineProperties, 'WritableObjectMode')
      checks.addPipelineCheck(issue, pipeline)
    }
    else if (isWritableOrWritableObjectMode) {
      issue = validators.pipelinePropertiesMatchFirstFlex.validate(pipeline, pipelineProperties)
      checks.addPipelineCheck(issue, pipeline)
    }
  }

  if (mode === 'last') {
    const isReadableOnly = canBeReadable && !canBeWritableObjectMode && !canBeWritable && !canBeReadableObjectMode
    const isReadableObjectModeOnly = canBeReadableObjectMode && !canBeWritable && !canBeReadable && !canBeWritableObjectMode
    const isReadableOrReadableObjectMode = canBeReadable && canBeReadableObjectMode && !canBeWritable && !canBeWritableObjectMode

    if (isReadableOnly) {
      issue = validators.pipelinePropertiesMatchLastStrict.validate(pipeline, pipelineProperties, 'Readable')
      checks.addPipelineCheck(issue, pipeline)
    }
    else if (isReadableObjectModeOnly) {
      issue = validators.pipelinePropertiesMatchLastStrict.validate(pipeline, pipelineProperties, 'ReadableObjectMode')
      checks.addPipelineCheck(issue, pipeline)
    }
    else if (isReadableOrReadableObjectMode) {
      issue = validators.pipelinePropertiesMatchLastFlex.validate(pipeline, pipelineProperties)
      checks.addPipelineCheck(issue, pipeline)
    }
  }
}

module.exports = validatePipelineProperty
