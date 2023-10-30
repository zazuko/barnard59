import { deepStrictEqual, strictEqual } from 'assert'
import { resolve } from 'path'
import { createPipeline } from 'barnard59-core'
import getStream from 'get-stream'
import { pipelineDefinitionLoader } from 'barnard59-test-support/loadPipelineDefinition.js'
import env from 'barnard59-env'

const loadPipelineDefinition = pipelineDefinitionLoader(import.meta.url, 'definitions')

describe('forEach', () => {
  it('should execute the example correctly', async () => {
    const ptr = await loadPipelineDefinition('foreach/csv-duplicate')
    const pipeline = createPipeline(ptr, { env, basePath: resolve('.') })

    const out = JSON.parse(await getStream(pipeline.stream))

    strictEqual(out.length, 24)
  })

  /*
  * This pipeline verifies that a variable can be imperatively
  * added during pipeline execution of a forEach step
  * */
  it('should preserve variables set during forEach execution', async () => {
    const ptr = await loadPipelineDefinition('foreach/with-handler')
    const pipeline = createPipeline(ptr, { env, basePath: resolve('.') })

    const out = await getStream.array(pipeline.stream)

    strictEqual(out.length > 0, true)
    strictEqual(out[0] !== out[1], true)
  })

  it('should be able to access variables from higher scopes', async () => {
    const ptr = await loadPipelineDefinition('foreach/with-variable')
    const pipeline = createPipeline(ptr, { env, basePath: resolve('.') })

    const out = await getStream.array(pipeline.stream)

    deepStrictEqual(out, [
      '/root/definitions/foreach/csv-duplicate.ttl',
      '/root/definitions/foreach/with-handler.ttl',
      '/root/definitions/foreach/with-variable.ttl',
    ])
  })
})
