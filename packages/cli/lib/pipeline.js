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

export const desugarWith = context => dataset => {
  const { knownOperations } = context
  const ptr = rdf.clownface({ dataset })
  let n = 0
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
        continue // log warning
      }

      const { type, link } = knownStep
      const args = step.out(quad.predicate)
      step.deleteOut(quad.predicate)
      // keep args only if non-empty
      if (!ns.rdf.nil.equals(args.term)) {
        step.addOut(ns.code.arguments, args)
      }
      step.addOut(ns.rdf.type, ns.p.Step)
      const moduleNode = ptr.blankNode(`impl_${n++}`)
      moduleNode.addOut(ns.rdf.type, type)
      moduleNode.addOut(ns.code.link, link)
      step.addOut(ns.code.implementedBy, moduleNode)
    }
  })

  return ptr.dataset
}

const desugar = async dataset => {
  const knownOperations = await discoverOperations()
  return desugarWith({ knownOperations })(dataset)
}

async function fileToDataset(filename) {
  return fromStream(rdf.dataset(), fromFile(filename))
}

export async function parse(filename, iri) {
  const dataset = await fileToDataset(filename)
  const ptr = findPipeline(await desugar(dataset), iri)

  return {
    basePath: resolve(dirname(filename)),
    ptr,
  }
}
