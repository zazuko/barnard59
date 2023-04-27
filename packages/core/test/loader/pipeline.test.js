import { strictEqual, rejects } from 'assert'
import { resolve } from 'path'
import clownface from 'clownface'
import { describe, it } from 'mocha'
import rdf from 'rdf-ext'
import { run } from '../../index.js'
import loader from '../../lib/loader/pipeline.js'
import loadPipelineDefinition from '../support/loadPipelineDefinition.js'

describe('loader/pipeline', () => {
  it('should use the given variables', async () => {
    const basePath = resolve('test')
    const ptr = await loadPipelineDefinition('plain')

    const variables = new Map([
      ['foo', 'bar'],
      ['hello', 'world'],
    ])

    const stream = await loader(ptr, { basePath, variables })
    await run(stream.pipeline, { resume: true })

    strictEqual(stream.pipeline.variables.get('foo'), 'bar')
    strictEqual(stream.pipeline.variables.get('hello'), 'world')
  })

  it('should reject if the referred resource does not have a pipeline type', async () => {
    const ptr = clownface({ dataset: rdf.dataset() }).blankNode()

    await rejects(async () => {
      await loader(ptr)
    })
  })
})
