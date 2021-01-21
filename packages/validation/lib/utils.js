const path = require('path')
const Issue = require('../lib/issue')

function removeFilePart (dirname) {
  return path.parse(dirname).dir
}

function printErrors (errors) {
  errors.forEach((error, i) => {
    if (Array.isArray(error)) {
      const [pipeline, pipelineErrors] = error
      if (pipelineErrors.length > 0) {
        console.error(`${i + 1}. In pipeline <${pipeline}>`)
        pipelineErrors.forEach((error, j) => {
          console.error(`${i + 1}.${j + 1}. ${error}`)
        })
      }
    }
    else {
      console.error(`${i + 1}. ${error}`)
    }
  })
}

function countValidationIssues (errors, verbose = false) {
  const collectedIssues = []
  errors.forEach((error) => {
    if (Array.isArray(error)) {
      const [, pipelineErrors] = error
      pipelineErrors.forEach((error) => {
        collectedIssues.push(error.level)
      })
    }
    else {
      collectedIssues.push(error.level)
    }
  })
  if (verbose) {
    return collectedIssues.length
  }
  return collectedIssues.filter(level => level === 'error').length
}

function validatePipelineProperty (pipeline, pipelineProperties, opProperties, mode, errors) {
  const canStreamBeWritable = opProperties.includes('Writable') || opProperties.includes('WritableObjectMode')
  const canStreamBeReadable = opProperties.includes('Readable') || opProperties.includes('ReadableObjectMode')
  const isStreamReadableOnly = canStreamBeReadable && !canStreamBeWritable
  const isStreamWritableOnly = canStreamBeWritable && !canStreamBeReadable

  let pipelineIsOfRightType = true
  let mssg = ''
  if ((mode === 'first') && isStreamWritableOnly) {
    pipelineIsOfRightType = pipelineProperties.includes('Writable') || pipelineProperties.includes('WritableObjectMode')
    mssg = 'The pipeline must be of type Writable or WritableObjectMode'
  }
  if ((mode === 'last') && isStreamReadableOnly) {
    pipelineIsOfRightType = pipelineProperties.includes('Readbale') || pipelineProperties.includes('ReadableObjectMode')
    mssg = 'The pipeline must be of type Readable or ReadableObjectMode'
  }

  if (!pipelineIsOfRightType) {
    const issue = Issue.error({
      message: `Invalid pipeline type for ${pipeline}. ${mssg}`
    })
    errors.push([pipeline, issue])
  }
}
module.exports = {
  removeFilePart,
  printErrors,
  countValidationIssues,
  validatePipelineProperty
}
