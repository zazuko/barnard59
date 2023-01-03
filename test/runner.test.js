import assert, { strictEqual } from 'assert'
import { resolve } from 'path'
import { describe, it } from 'mocha'
import winston from 'winston'
import runner from '../runner.js'
import loadPipelineDefinition from './support/loadPipelineDefinition.js'
import { InMemoryLogs } from './support/logger.js'

describe('run', () => {
  it('should emit an error if an error in the pipeline occurs', async () => {
    const ptr = await loadPipelineDefinition('error')
    const run = runner(ptr, {
      outputStream: process.stdout,
      basePath: resolve('test')
    })

    try {
      await run
    } catch (err) {
      strictEqual(err.message, 'error in pipeline step http://example.org/error')
    }
  })

  it('should mask sensitive variables', async () => {
    const ptr = await loadPipelineDefinition('simple')
    const transport = new InMemoryLogs()
    const logger = winston.createLogger({
      level: 'info',
      transports: [transport]
    })
    const run = runner(ptr, {
      outputStream: process.stdout,
      logger,
      variables: new Map([
        ['SECRET_VAR', 'for your eyes only']
      ])
    })

    await run

    assert(transport.messages.some(msg => /SECRET_VAR: \*\*\*/.test(msg)))
  })
})
