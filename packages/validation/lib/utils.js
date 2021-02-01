const path = require('path')
const deepEqual = require('deep-equal')
const fs = require('fs')

function removeFilePart (dirname) {
  return path.parse(dirname).dir
}

function checkArrayContainsField (array, field, value) {
  let found = false
  for (let i = 0; i < array.length; i++) {
    if (array[i][field] === value) {
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
    const expectedManifestPath = path.join(modulePath, 'operations.ttl')

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
  checkArrayContainsField,
  checkArrayContainsObject
}
