import module from 'node:module'
import { dirname, resolve } from 'node:path'
import * as url from 'url'
import rdf from 'barnard59-env'
import { isGraphPointer } from 'is-graph-pointer'
import { packageDirectory } from 'pkg-dir'
import iriResolve from 'rdf-loader-code/lib/iriResolve.js'
import isInstalledGlobally from 'is-installed-globally'
import transformImports from 'rdf-transform-graph-imports'
import findPipeline from '../findPipeline.js'
import discoverManifests from './discoverManifests.js'

/**
 * @typedef {Map<import('@rdfjs/types').Term, { type: import('@rdfjs/types').NamedNode, link: import('@rdfjs/types').NamedNode }>} OperationMap
 */

/**
 * @param {string} pipelinePath
 * @returns {Promise<OperationMap>}
 */
const discoverOperations = async (pipelinePath) => {
  const ops = rdf.termMap()
  for await (const { manifest } of discoverManifests({ basePath: pipelinePath, all: true })) {
    manifest
      .has(rdf.ns.rdf.type, rdf.ns.p.Operation)
      .forEach(operation => {
        const impl = operation.out(rdf.ns.code.implementedBy)
        const type = impl.out(rdf.ns.rdf.type).term
        const link = impl.out(rdf.ns.code.link).term
        ops.set(operation.term, { type, link })
      })
  }

  return ops
}

/**
 * @param {import('@rdfjs/types').DatasetCore} dataset
 * @param {object} options
 * @param {import('winston').Logger} [options.logger]
 * @param {OperationMap} [options.knownOperations]
 * @param {string} options.pipelinePath
 * @returns {Promise<import('@rdfjs/types').DatasetCore>}
 */
export const desugar = async (dataset, { logger, knownOperations, pipelinePath }) => {
  const operations = knownOperations ?? await discoverOperations(pipelinePath)
  const dir = await packageDirectory({
    cwd: pipelinePath,
  })
  const require = module.createRequire(dir + '/')

  const ptr = rdf.clownface({ dataset })
  let n = 0
  ptr.has(rdf.ns.p.stepList).out(rdf.ns.p.stepList).forEach(listPointer => {
    for (const step of (listPointer.list() || [])) {
      if (isGraphPointer(step.has(rdf.ns.rdf.type, rdf.ns.p.Step)) ||
        isGraphPointer(step.has(rdf.ns.rdf.type, rdf.ns.p.Pipeline))) {
        continue
      }
      // we expect a known operation
      const [quad] = step.dataset.match(step.term)
      const knownStep = operations.get(quad?.predicate)
      if (!knownStep) {
        logger?.warn(`Operation <${quad?.predicate.value}> not found in known manifests. Have you added the right \`barnard59-*\` package as dependency?`)
        continue
      }

      let { type, link } = knownStep
      const { pathname, filename, hash, protocol } = iriResolve(link.value, pipelinePath)

      if (protocol === 'node:' && isInstalledGlobally) {
        // must resolve node: links to absolute paths to overcome node resolution issues in global context
        const resolved = require.resolve(pathname)
        if (filename !== resolved) {
          link = rdf.namedNode(url.pathToFileURL(resolved).toString() + hash)
        }
      }

      const args = step.out(quad.predicate)
      step.deleteOut(quad.predicate)
      // keep args only if non-empty
      if (!rdf.ns.rdf.nil.equals(args.term)) {
        step.addOut(rdf.ns.code.arguments, args)
      }
      step.addOut(rdf.ns.rdf.type, rdf.ns.p.Step)
      const moduleNode = ptr.blankNode(`impl_${n++}`)
      moduleNode.addOut(rdf.ns.rdf.type, type)
      moduleNode.addOut(rdf.ns.code.link, link)
      step.addOut(rdf.ns.code.implementedBy, moduleNode)
    }
  })

  return ptr.dataset
}

/**
 * @param {string} filename
 * @return {Promise<import('@rdfjs/types').DatasetCore>}
 */
async function fileToDataset(filename) {
  const stream = rdf.fromFile(filename, {
    implicitBaseIRI: true,
  }).pipe(transformImports(rdf))
  return rdf.dataset().import(stream)
}

/**
 * @param {string} filename
 * @param {string | import('@rdfjs/types').NamedNode} [iri]
 * @param {object} [options]
 * @param {import('winston').Logger} [options.logger]
 * @return {Promise<{ basePath: string, ptr: import('clownface').GraphPointer }>}
 */
export async function parse(filename, iri, { logger } = {}) {
  const dataset = await fileToDataset(filename)
  const ptr = findPipeline(await desugar(dataset, { logger, pipelinePath: resolve(filename) }), iri)

  return {
    basePath: resolve(dirname(filename)),
    ptr,
  }
}
