import fs from 'fs'
import path from 'path'
import * as url from 'url'
import * as module from 'module'
import { manifestLocation } from './config.js'

const __dirname = url.fileURLToPath(new URL('.', import.meta.url))
const require = module.createRequire(url.fileURLToPath(import.meta.url))

require.extensions['.ts'] = require.extensions['.js']

const resolvePaths = [
  process.cwd(),
  __dirname,
]

export function removeFilePart(dirname) {
  return path.parse(dirname).dir
}

export function isModuleInstalled(library) {
  try {
    removeFilePart(require.resolve(library, { paths: resolvePaths }))
    return true
  } catch (err) {
  }
  return false
}

export function getManifestPath(library) {
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
  } catch (err) {
  }

  return null
}

export function template([first, ...rest], ...fields) {
  return (values = {}) => {
    const templated = fields.map(
      (field) => field in values ? values[field] : '${' + field + '}',
    )
    return rest.reduce((acc, str, i) => acc + templated[i] + str, first)
  }
}
