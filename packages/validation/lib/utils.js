const path = require('path')
const Issue = require('../lib/issue')
const rules = require('./schema')
const deepEqual = require('deep-equal')

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
      // pipelineErrors.forEach((error) => {
      //  collectedIssues.push(error.level)
      // })
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

function validatePipelineProperty (pipeline, pipelineProperties, opProperties, mode, checks) {
  const canStreamBeWritable = opProperties.includes('Writable') || opProperties.includes('WritableObjectMode')
  const canStreamBeReadable = opProperties.includes('Readable') || opProperties.includes('ReadableObjectMode')

  let issue
  if (mode === 'first') {
    const isStreamWritableOnly = canStreamBeWritable && !canStreamBeReadable
    if (isStreamWritableOnly) {
      const pipelineIsOfRightType = pipelineProperties.includes('Writable') || pipelineProperties.includes('WritableObjectMode')
      if (!pipelineIsOfRightType) {
        issue = Issue.error({ message: rules.pipelinePropertiesMatchFirst.messageFailure(pipeline) })
      }
      else {
        issue = Issue.info({ message: rules.pipelinePropertiesMatchFirst.messageSuccess(pipeline) })
      }
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

function checkArrayContainsMessage (array, mssg) {
  let found = false
  for (let issue = 0; issue < array.length; issue++) {
    if (array[issue].message === mssg) {
      found = true
      break
    }
  }
  return found
}

function checkArrayContainsObject (array, obj) {
  let found = false
  for (let i = 0; i < array.length; i++) {
    if (deepEqual(array[i], obj)) {
      found = true
      break
    }
  }
  return found
}
module.exports = {
  removeFilePart,
  printErrors,
  countValidationIssues,
  validatePipelineProperty,
  checkArrayContainsMessage,
  checkArrayContainsObject
}
