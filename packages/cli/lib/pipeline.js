import { dirname, resolve } from 'path'
import rdf from 'barnard59-env'
import { isGraphPointer } from 'is-graph-pointer'
import findPipeline from '../findPipeline.js'
import discoverManifests from './discoverManifests.js'

const discoverOperations = async () => {
  const ops = rdf.termMap()
  for await (const { manifest } of discoverManifests()) {
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

export const desugar = async (dataset, { logger, knownOperations } = {}) => {
  knownOperations = knownOperations ?? await discoverOperations()
  const ptr = rdf.clownface({ dataset })
  let n = 0
  ptr.has(rdf.ns.p.stepList).out(rdf.ns.p.stepList).forEach(listPointer => {
    for (const step of listPointer.list()) {
      if (isGraphPointer(step.has(rdf.ns.rdf.type, rdf.ns.p.Step)) ||
          isGraphPointer(step.has(rdf.ns.rdf.type, rdf.ns.p.Pipeline))) {
        continue
      }
      // we expect a known operation
      const [quad] = step.dataset.match(step.term)
      const knownStep = knownOperations.get(quad?.predicate)
      if (!knownStep) {
        logger?.warn(`Operation <${quad?.predicate.value}> not found in known manifests. Have you added the right \`barnard59-*\` package as dependency?`)
        continue
      }

      const { type, link } = knownStep
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

async function fileToDataset(filename) {
  return rdf.dataset().import(rdf.fromFile(filename))
}

export async function parse(filename, iri, { logger } = {}) {
  const dataset = await fileToDataset(filename)
  const ptr = findPipeline(await desugar(dataset, { logger }), iri)

  return {
    basePath: resolve(dirname(filename)),
    ptr,
  }
}
