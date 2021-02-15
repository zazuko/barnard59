const fs = require('fs')
const path = require('path')
const { manifestLocation } = require('./config')

const resolvePaths = [
  process.cwd(),
  __dirname
]

function removeFilePart (dirname) {
  return path.parse(dirname).dir
}

function isModuleInstalled (library) {
  try {
    removeFilePart(require.resolve(library, { paths: resolvePaths }))
    return true
  }
  catch (err) {
  }
  return false
}

function getManifestPath (library) {
  const override = manifestLocation[library]
  if (override) {
    library = override
  }
  try {
    const libraryPath = removeFilePart(require.resolve(library, { paths: resolvePaths }))
    const expectedManifestPath = path.join(libraryPath, 'manifest.ttl')

    if (fs.existsSync(expectedManifestPath)) {
      return expectedManifestPath
    }
  }
  catch (err) {
  }

  return null
}

function template ([first, ...rest], ...fields) {
  return (values = {}) => {
    const templated = fields.map(
      (field) => field in values ? values[field] : '${' + field + '}'
    )
    return rest.reduce((acc, str, i) => acc + templated[i] + str, first)
  }
}

module.exports = {
  removeFilePart,
  getManifestPath,
  isModuleInstalled,
  template
}
