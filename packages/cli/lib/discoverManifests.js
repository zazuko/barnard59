import * as module from 'module'
import fs from 'fs'
import findPlugins from 'find-plugins'
import fromFile from 'rdf-utils-fs/fromFile.js'
import fromStream from 'rdf-dataset-ext/fromStream.js'
import rdf from '@zazuko/env'

const packagePattern = /^barnard59-(.+)$/
const require = module.createRequire(import.meta.url)

export default async function * () {
  const packages = findPlugins({
    includeDev: true,
    filter({ pkg }) {
      return packagePattern.test(pkg.name) && hasManifest(pkg.name)
    },
  })

  for (const { pkg } of packages) {
    const { version } = require(`${pkg.name}/package.json`)
    const dataset = await fromStream(rdf.dataset(), fromFile(require.resolve(`${pkg.name}/manifest.ttl`)))
    yield {
      name: pkg.name.match(packagePattern)[1],
      manifest: rdf.clownface({ dataset }),
      version,
    }
  }
}

function hasManifest(pkg) {
  try {
    fs.accessSync(require.resolve(`${pkg}/manifest.ttl`))
    return true
  } catch {
    return false
  }
}
