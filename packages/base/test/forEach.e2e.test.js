import { deepStrictEqual, strictEqual } from 'assert'
import { resolve } from 'path'
import { createPipeline } from 'barnard59-core'
import getStream from 'get-stream'
import { describe, it } from 'mocha'
import loadPipelineDefinition from './support/loadPipelineDefinition.js'

describe('forEach', () => {
  it('should execute the example correctly', async () => {
    const ptr = await loadPipelineDefinition('e2e/foreach-csv-duplicate')
    const pipeline = createPipeline(ptr, { basePath: resolve('test') })

    const out = JSON.parse(await getStream(pipeline.stream))

    strictEqual(out.length, 24)
  })

  /*
  * This pipeline verifies that a variable can be imperatively
  * added during pipeline execution of a forEach step
  * */
  it('should preserve variables set during forEach execution', async () => {
    const ptr = await loadPipelineDefinition('e2e/foreach-with-handler')
    const pipeline = createPipeline(ptr, { basePath: resolve('test') })

    const out = await getStream.array(pipeline.stream)

    strictEqual(out.length > 0, true)
    strictEqual(out[0] !== out[1], true)
  })

  it('should be able to access variables from higher scopes', async () => {
    const ptr = await loadPipelineDefinition('e2e/foreach-with-variable')
    const pipeline = createPipeline(ptr, { basePath: resolve('test') })

    const out = await getStream.array(pipeline.stream)

    deepStrictEqual(out, [
      '/root/test/support/definitions/e2e/foreach-csv-duplicate.ttl',
      '/root/test/support/definitions/e2e/foreach-with-handler.ttl',
      '/root/test/support/definitions/e2e/foreach-with-variable.ttl'
    ])
  })
})
