import { rejects, strictEqual } from 'node:assert'
import { createRequire } from 'node:module'
import rdf from 'barnard59-env'
import { fileToDataset } from '../lib/pipeline.js'
import filenamePipelineDefinition from './support/filenamePipelineDefinition.js'

const require = createRequire(import.meta.url)

describe('fileToDataset', function () {
  it('loads both the pipeline and its relative code:imports', async function () {
    const filename = require.resolve('barnard59-test-e2e/definitions/code-imports/main.ttl')

    const dataset = await fileToDataset(filename)

    const pipelines = dataset.match(null, rdf.ns.rdf.type, rdf.ns.p.Pipeline)
    strictEqual(pipelines.size, 2)
    strictEqual(pipelines.has(rdf.quad(rdf.namedNode('http://example.org/pipeline/'), rdf.ns.rdf.type, rdf.ns.p.Pipeline)), true)
    strictEqual(pipelines.has(rdf.quad(rdf.namedNode('http://example.org/pipeline/out'), rdf.ns.rdf.type, rdf.ns.p.Pipeline)), true)
    strictEqual(dataset.match(null, rdf.ns.code.imports).size, 0)
  })

  it('rejects when the pipeline file is missing', async function () {
    await rejects(fileToDataset(filenamePipelineDefinition('missing-pipeline')), { code: 'ENOENT' })
  })

  it('rejects when an import target is invalid', async function () {
    await rejects(fileToDataset(filenamePipelineDefinition('invalid-import')), /Failed to import:.*Import target must be a NamedNode/)
  })
})
