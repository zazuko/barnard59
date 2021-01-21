const path = require('path')
const Issue = require('../lib/issue')

function removeFilePart (dirname) {
  return path.parse(dirname).dir
}

function printErrors (pipelines, errors, levels) {
  errors.filter(issue => !Array.isArray(issue))
    .filter(issue => levels.includes(issue.level))
    .forEach((issue) => {
      console.error(`- ${issue}`)
    })

  if (!pipelines) {
    return
  }

  Object.entries(pipelines)
    .forEach(([pipelineIRI, _steps], i) => {
      // TODO: group output per step
      const pipelineErrors = errorsForPipeline(pipelineIRI, errors, levels)
      if (pipelineErrors.length > 0) {
        console.error(`${i + 1}. In pipeline <${pipelineIRI}>`)
        pipelineErrors.forEach((issue, j) => {
          console.error(`${i + 1}.${j + 1}. ${issue}`)
        })
      }
    })
}

function errorsForPipeline (pipelineIRI, errors, levels) {
  const [_pipelineIRI, issues] = errors
    .filter(issue => Array.isArray(issue))
    .find(([pipeline, _pipelineErrors]) => pipeline === pipelineIRI)

  return issues.filter(issue => levels.includes(issue.level))
}

function countValidationIssues (errors, strict = false) {
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
  if (strict) {
    return collectedIssues
      .filter(level => ['warning', 'error'].includes(level))
      .length
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
