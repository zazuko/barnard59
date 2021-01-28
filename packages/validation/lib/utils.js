const path = require('path')
const Issue = require('../lib/issue')
const rules = require('./schema')
const deepEqual = require('deep-equal')
const fs = require('fs')

function removeFilePart (dirname) {
  return path.parse(dirname).dir
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

function isModuleInstalled (module) {
  try {
    removeFilePart(require.resolve(module))
    return true
  }
  catch (err) {
    return false
  }
}

function getManifestPath (module) {
  let manifestPath = null
  try {
    const modulePath = removeFilePart(require.resolve(module))
    const expectedManifestPath = `${modulePath}/operations.ttl`// path.join(modulePath, 'manifest.ttl')

    if (fs.existsSync(expectedManifestPath)) {
      manifestPath = expectedManifestPath
    }
  }
  catch (err) {
  }

  return manifestPath
}

module.exports = {
  removeFilePart,
  getManifestPath,
  isModuleInstalled,
  validatePipelineProperty,
  checkArrayContainsField,
  checkArrayContainsObject
}
