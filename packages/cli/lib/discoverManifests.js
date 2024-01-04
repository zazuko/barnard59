import * as module from 'module'
import { exec } from 'child_process'
import { dirname } from 'path'
import { getInstalledPackage } from 'pkgscan'
import isInstalledGlobally from 'is-installed-globally'
import rdf from 'barnard59-env'
import { packageDirectory } from 'pkg-dir'
import { findUp } from 'find-up'

const packagePattern = /^barnard59-(.+)$/

/**
 * @param {object} [options]
 * @param {string} [options.basePath]
 * @param {boolean} [options.all]
 * @returns {AsyncGenerator<{ name: string, manifest: import('clownface').AnyPointer, version: string }, void, unknown>}
 */
export default async function * ({ basePath = import.meta.url, all = false } = {}) {
  const require = module.createRequire(basePath)
  const hasManifest = canRequireManifest.bind(null, require)

  const packages = (await getInstalledPackages(all)).filter(hasManifest)

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
    const matched = pkg.match(packagePattern)
    if (matched) {
      yield {
        name: matched[1],
        manifest: rdf.clownface({ dataset }),
        version,
      }
    }
  }
}

/**
 * @param {boolean} [all]
 * @return {Promise<string[]>}
 */
async function getInstalledPackages(all) {
  if (isInstalledGlobally) {
    let npmList = 'npm list -g'
    if (all) {
      npmList += ' --all'
    }
    return new Promise((resolve, reject) => {
      exec(npmList, (err, stdout) => {
        if (err) {
          reject(err)
        } else {
          resolve([...new Set(stdout.match(/(?<pkg>barnard59-[^@]+)/g))])
        }
      })
    })
  }

  const packagePath = await findUp(['package-lock.json', 'yarn.lock'])
  if (!packagePath) {
    return []
  }
  return (getInstalledPackage('barnard59-*', dirname(packagePath)) || []).map(pkg => pkg.name)
}

/**
 * @param {NodeRequire} require
 * @param {string} [pkg]
 * @returns {boolean}
 */
function canRequireManifest(require, pkg) {
  try {
    require.resolve(`${pkg}/manifest.ttl`)
    return true
  } catch {
    return false
  }
}
