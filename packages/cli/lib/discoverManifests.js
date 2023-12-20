import * as module from 'module'
import fs from 'fs'
import { exec } from 'child_process'
import { dirname } from 'path'
import { getInstalledPackage } from 'pkgscan'
import isInstalledGlobally from 'is-installed-globally'
import rdf from 'barnard59-env'
import { packageDirectory } from 'pkg-dir'
import { findUp } from 'find-up'

const packagePattern = /^barnard59-(.+)$/
const require = module.createRequire(import.meta.url)

export default async function * () {
  const packages = (await getInstalledPackages()).filter(hasManifest)

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
    const { version } = require(`${pkg}/package.json`)
    const dataset = await rdf.dataset().import(rdf.fromFile(require.resolve(`${pkg}/manifest.ttl`)))
    yield {
      name: pkg.match(packagePattern)[1],
      manifest: rdf.clownface({ dataset }),
      version,
    }
  }
}

async function getInstalledPackages() {
  if (isInstalledGlobally) {
    return new Promise((resolve, reject) => {
      exec('npm list -g --depth=0 --json', (err, stdout) => {
        if (err) {
          reject(err)
        } else {
          resolve(Object.keys(JSON.parse(stdout).dependencies).filter(pkg => packagePattern.test(pkg)))
        }
      })
    })
  }

  const packagePath = await findUp(['package-lock.json', 'yarn.lock'])
  return getInstalledPackage('barnard59-*', dirname(packagePath)).map(pkg => pkg.name)
}

function hasManifest(pkg) {
  try {
    fs.accessSync(require.resolve(`${pkg}/manifest.ttl`))
    return true
  } catch {
    return false
  }
}
