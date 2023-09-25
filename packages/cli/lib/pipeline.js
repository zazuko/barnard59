import { dirname, resolve } from 'path'
import fromStream from 'rdf-dataset-ext/fromStream.js'
import rdf from '@zazuko/env'
import { isGraphPointer } from 'is-graph-pointer'
import fromFile from 'rdf-utils-fs/fromFile.js'
import findPipeline from '../findPipeline.js'
import discoverManifests from './discoverManifests.js'
import ns from './namespaces.js'

const discoverOperations = async () => {
  const ops = rdf.termMap()
  for await (const { manifest } of discoverManifests()) {
    manifest
      .has(rdf.ns.rdf.type, ns.p.Operation)
      .forEach(operation => {
        const impl = operation.out(ns.code.implementedBy)
        const type = impl.out(ns.rdf.type).term
        const link = impl.out(ns.code.link).term
        ops.set(operation.term, { type, link })
      })
  }

  return ops
}

export const desugar = async (dataset, { logger, knownOperations } = {}) => {
  knownOperations = knownOperations ?? await discoverOperations()
  const ptr = rdf.clownface({ dataset })
  ptr.has(ns.p.stepList).out(ns.p.stepList).forEach(listPointer => {
    for (const step of listPointer.list()) {
      if (isGraphPointer(step.has(ns.rdf.type, ns.p.Step)) ||
          isGraphPointer(step.has(ns.rdf.type, ns.p.Pipeline))) {
        continue
      }
      // we expect a known operation
      const [quad] = step.dataset.match(step.term)
      const knownStep = knownOperations.get(quad?.predicate)
      if (!knownStep) {
        logger?.warn(`Operation <${quad?.predicate.value}> not found in known manifests. Have you added the right \`branard59-*\` package as dependency?`)
        continue
      }

      const { type, link } = knownStep
      const args = step.out(quad.predicate)
      step.deleteOut(quad.predicate)
      // keep args only if non-empty
      if (!ns.rdf.nil.equals(args.term)) {
        step.addOut(ns.code.arguments, args)
      }
      step.addOut(ns.rdf.type, ns.p.Step)
      step.addOut(ns.code.implementedBy, moduleNode => {
        moduleNode.addOut(ns.rdf.type, type)
        moduleNode.addOut(ns.code.link, link)
      })
    }
  })

  return ptr.dataset
}

async function fileToDataset(filename) {
  return fromStream(rdf.dataset(), fromFile(filename))
}

export async function parse(filename, iri, { logger } = {}) {
  const dataset = await fileToDataset(filename)
  const ptr = findPipeline(await desugar(dataset, { logger }), iri)

  return {
    basePath: resolve(dirname(filename)),
    ptr,
  }
}
