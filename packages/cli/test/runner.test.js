import assert, { strictEqual } from 'assert'
import { resolve } from 'path'
import { pipelineDefinitionLoader } from 'barnard59-test-support/loadPipelineDefinition.js'
import runner from '../runner.js'

const loadPipelineDefinition = pipelineDefinitionLoader(import.meta.url)

describe('run', () => {
  it('should emit an error if an error in the pipeline occurs', async () => {
    const ptr = loadPipelineDefinition('error')
    const run = runner(ptr, {
      outputStream: process.stdout,
      basePath: resolve('test'),
    })

    try {
      await run.promise
    } catch (err) {
      strictEqual(err.message, 'error in pipeline step http://example.org/error')
      return
    }

    assert(false)
  })
})
