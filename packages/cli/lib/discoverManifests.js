import * as module from 'module'
import fs from 'fs'
import { getInstalledPackage } from 'pkgscan'
import rdf from 'barnard59-env'
import { packageDirectory } from 'pkg-dir'

const packagePattern = /^barnard59-(.+)$/
const require = module.createRequire(import.meta.url)

export default async function * () {
  const packages = getInstalledPackage('barnard59-*', process.cwd())
    .filter((pkg) => {
      return hasManifest(pkg.name)
    })

  const dir = await packageDirectory()
  if (hasManifest(dir)) {
    const { name, version } = require(`${dir}/package.json`)
    yield {
      name: packagePattern.test(name) ? name.match(packagePattern)[1] : name,
      manifest: rdf.clownface({ dataset: await rdf.dataset().import(rdf.fromFile(`${dir}/manifest.ttl`)) }),
      version,
    }
  }

  for (const pkg of packages) {
    const { version } = require(`${pkg.name}/package.json`)
    const dataset = await rdf.dataset().import(rdf.fromFile(require.resolve(`${pkg.name}/manifest.ttl`)))
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
