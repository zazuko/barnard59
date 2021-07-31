import { deepStrictEqual, strictEqual } from 'assert'
import { describe, it } from 'mocha'
import { Readable, Writable } from 'readable-stream'
import { defaultLogger } from '../index.js'
import run from '../lib/run.js'

describe('run', () => {
  it('should be a function', () => {
    strictEqual(typeof run, 'function')
  })

  it('should wait for the pipeline and the logger', async () => {
    const pipeline = {
      stream: new Readable({
        read: () => pipeline.stream.push(null)
      }),
      logger: defaultLogger()
    }

    const events = []
    pipeline.stream.on('end', () => events.push('pipeline:end'))
    pipeline.logger.on('finish', () => events.push('logger:finish'))

    pipeline.stream.resume()

    await run(pipeline)

    deepStrictEqual(events, ['pipeline:end', 'logger:finish'])
  })

  it('should resume if resume flag is true', async () => {
    const pipeline = {
      stream: new Readable({
        read: () => pipeline.stream.push(null)
      }),
      logger: defaultLogger()
    }

    const events = []
    pipeline.stream.on('end', () => events.push('pipeline:end'))

    await run(pipeline, { resume: true })

    deepStrictEqual(events, ['pipeline:end'])
  })

  it('should end if end flag is true', async () => {
    const pipeline = {
      stream: new Writable({
        write: (chunk, encoding, callback) => callback(),
        final: callback => callback()
      }),
      logger: defaultLogger()
    }

    const events = []
    pipeline.stream.on('finish', () => events.push('pipeline:finish'))

    await run(pipeline, { end: true })

    deepStrictEqual(events, ['pipeline:finish'])
  })
})
