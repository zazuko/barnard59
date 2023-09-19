import { resolve } from 'path'
import approvals from 'approvals'
import rdf from '@zazuko/env'
import toCanonical from 'rdf-dataset-ext/toCanonical.js'
import { pipelineDefinitionLoader } from 'barnard59-test-support/loadPipelineDefinition.js'
import { desugarWith } from '../lib/pipeline.js'

const dirname = resolve('test', 'support', 'approvals')

const loadPipelineDefinition = pipelineDefinitionLoader(import.meta.url)

// test double for a fake context
const knownOperations = rdf.termMap([
  [rdf.namedNode('http://barnard59.zazuko.com/operations/concat'), {
    type: rdf.namedNode('https://code.described.at/EcmaScriptModule'),
    link: rdf.namedNode('node:barnard59-base#concat'),
  }],
])

const check = async name => {
  const pipeline = await loadPipelineDefinition(name)
  const sut = desugarWith({ knownOperations })

  const result = sut(pipeline.dataset)

  approvals.verify(dirname, name, toCanonical(result))
}

describe('simplified syntax', () => {
  it('should desugar simplified syntax', async () => {
    await check('simplified-step-args')
  })
  it('should ignore empty arguments', async () => {
    await check('simplified-step-noargs')
  })
  it('should process also sub-pipelines', async () => {
    await check('simplified-step-sub')
  })
  it('should handle named arguments', async () => {
    await check('simplified-step-args-named')
  })
})
