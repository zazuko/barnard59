import { promisify } from 'util'
import { SpanStatusCode } from '@opentelemetry/api'
import { finished } from 'readable-stream'
import tracer from './tracer.js'
import type Pipeline from './Pipeline.js'
import { isWritable } from './factory/stream.js'

async function run(pipeline: Pipeline, { end = false, resume = false } = {}) {
  await tracer.startActiveSpan('run', async span => {
    try {
      if (end && isWritable(pipeline)) {
        pipeline.stream.end()
      }

      if (resume) {
        pipeline.stream.resume()
      }

      await promisify(finished)(pipeline.stream)

      const p = new Promise<void>(resolve => {
        pipeline.logger.on('finish', () => resolve())
      })

      if (pipeline.error) {
        throw pipeline.error
      }
      pipeline.logger.end()
      await p
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      span.recordException(err)
      span.setStatus({ code: SpanStatusCode.ERROR, message: err.message })
      throw err
    } finally {
      span.end()
    }
  })
}

export default run
