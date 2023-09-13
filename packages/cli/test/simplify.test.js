import { expect } from 'chai'
import rdf from '@zazuko/env'
import toCanonical from 'rdf-dataset-ext/toCanonical.js'
import { pipelineDefinitionLoader } from 'barnard59-test-support/loadPipelineDefinition.js'
import ns from '../lib/namespaces.js'

const loadPipelineDefinition = pipelineDefinitionLoader(import.meta.url)

ns.code = rdf.namespace('https://code.described.at/')
ns.base = rdf.namespace('http://example.org/pipeline/')

const knownImplementations = rdf.termMap([
  [rdf.namedNode('http://barnard59.zazuko.com/operations/concat'), rdf.namedNode('node:barnard59-base#concat')],
])

// test double for a fake context
const tryGetKnownStep = x => knownImplementations.get(x)

// to be moved
const desugar = context => ptr => {
  const { tryGetKnownStep } = context
  let n = 0
  for (const step of ptr.has(ns.rdf.type, ns.p.Pipeline)
    .out(ns.p.steps)
    .out(ns.p.stepList)
    .list()) {
    if (step.out(ns.code.implementedBy).terms.length === 0) {
      // when there is no implementation, we expect a known
      const [quad] = step.dataset.match(step.term)
      const knownStep = tryGetKnownStep(quad.predicate)
      if (knownStep) {
        const args = step.out(quad.predicate)
        step.deleteOut(quad.predicate)
        step.addOut(ns.code.arguments, args)
        step.addOut(ns.rdf.type, ns.p.Step)
        const moduleNode = ptr.blankNode(`impl_${n++}`)
        moduleNode.addOut(ns.rdf.type, ns.code.EcmaScriptModule)
        moduleNode.addOut(ns.code.link, knownStep)
        step.addOut(ns.code.implementedBy, moduleNode)
      }
    }
  }
  return ptr.dataset
}

describe('simplified syntax', () => {
  it.only('should desugar simplified syntax', async () => {
    const expected = await loadPipelineDefinition('simplified-step-args-expected')
    const pipeline = await loadPipelineDefinition('simplified-step-args')
    const sut = desugar({ tryGetKnownStep })

    const result = sut(pipeline)

    expect(toCanonical(result)).to.eq(toCanonical(expected.dataset))
  })
})
