import assert, { strictEqual } from 'assert'
import { resolve } from 'path'
import { pipelineDefinitionLoader } from 'barnard59-test-support/loadPipelineDefinition.js'
import env from 'barnard59-env'
import runner from '../runner.js'

const loadPipelineDefinition = pipelineDefinitionLoader(import.meta.url)

describe('run', () => {
  it('should emit an error if an error in the pipeline occurs', async () => {
    const ptr = await loadPipelineDefinition('error')
    const run = await runner(ptr, env, {
      outputStream: process.stdout,
      basePath: resolve('test'),
    })

    try {
      await run.finished
    } catch (err) {
      strictEqual(err.message, 'test')
      return
    }

    assert(false)
  })
})
