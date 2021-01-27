const path = require('path')
const Issue = require('../lib/issue')
const rules = require('./schema')
const deepEqual = require('deep-equal')

function removeFilePart (dirname) {
  return path.parse(dirname).dir
}

function printErrors (checks, levels, splitByPipelines = false) {
  for (const level of levels) {
    const issues = checks.getChecks(level)
    for (const issue of issues) {
      console.error(`- ${issue}`)
    }
  }

  if (!splitByPipelines) {
    return
  }

  for (const pipeline of Object.keys(checks.pipelines)) {
    let i = 0
    for (const level of levels) {
      const issues = checks.getPipelineChecks(pipeline, level)
      if (issues.length > 0) {
        console.error(`${i + 1}. In pipeline <${pipeline}>`)
        issues.forEach((issue, j) => {
          console.error(`${i + 1}.${j + 1}. ${issue}`)
        })
      }
    }
    i++
  }
}

function countValidationIssues (checks, strict = false) {
  let count = checks.getChecks('error').length
  if (strict) {
    count += checks.getChecks('warning').length
  }
  return count
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
      checks.setPipelineCheck(issue, pipeline)
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
      checks.setPipelineCheck(issue, pipeline)
    }
  }
}

function checkArrayContainsField (array, field, value) {
  let found = false
  for (let i = 0; i < array.length; i++) {
    if (array[i][[field]] === value) {
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
  checkArrayContainsField,
  checkArrayContainsObject
}
