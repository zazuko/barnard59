import { strictEqual } from 'assert'
import { resolve } from 'path'
import runner from '../runner.js'
import loadPipelineDefinition from './support/loadPipelineDefinition.js'

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
    }
  })
})
