import { promisify } from 'util'
import { SpanStatusCode } from '@opentelemetry/api'
import { finished } from 'readable-stream'
import tracer from './tracer.js'

async function run (pipeline, { end = false, resume = false } = {}) {
  await tracer.startSpan('run', async span => {
    try {
      if (end) {
        pipeline.stream.end()
      }

      if (resume) {
        pipeline.stream.resume()
      }

      await promisify(finished)(pipeline.stream)

      const p = new Promise(resolve => {
        pipeline.logger.on('finish', () => resolve())
      })

      pipeline.logger.end()
      await p
    } catch (err) {
      span.recordException(err)
      span.setStatus({ code: SpanStatusCode.ERROR, message: err.message })
      throw err
    } finally {
      span.end()
    }
  })
}

export default run
