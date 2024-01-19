import { strictEqual, rejects } from 'assert'
import { resolve } from 'path'
import rdf from 'barnard59-env'
import { pipelineDefinitionLoader } from 'barnard59-test-support/loadPipelineDefinition.js'
import { run } from '../../index.js'
import loader from '../../lib/loader/pipeline.js'

const loadPipelineDefinition = pipelineDefinitionLoader(import.meta.url, '../support/definitions')
const context = { env: rdf }

describe('loader/pipeline', () => {
  it('should use the given variables', async () => {
    const { ptr, basePath } = await loadPipelineDefinition('plain')

    const variables = new Map([
      ['foo', 'bar'],
      ['hello', 'world'],
    ])

    const stream = await loader(ptr, { context, basePath, variables })
    await run(stream.pipeline, { resume: true })

    strictEqual(stream.pipeline.variables.get('foo'), 'bar')
    strictEqual(stream.pipeline.variables.get('hello'), 'world')
  })

  it('should reject if the referred resource does not have a pipeline type', async () => {
    const ptr = rdf.clownface({ dataset: rdf.dataset() }).blankNode()

    await rejects(async () => {
      await loader(ptr, { context })
    })
  })
})
