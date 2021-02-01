const fs = require('fs')
const path = require('path')

function removeFilePart (dirname) {
  return path.parse(dirname).dir
}

function isModuleInstalled (module) {
  try {
    removeFilePart(require.resolve(module))
    return true
  }
  catch (err) {
  }
  return false
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
  isModuleInstalled
}
