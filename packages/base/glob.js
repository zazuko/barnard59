import { promisify } from 'util'
import { SpanStatusCode } from '@opentelemetry/api'
import globFn from 'glob'
import once from 'lodash/once.js'
import { Readable } from 'readable-stream'
import tracer from './lib/tracer.js'

function glob ({ pattern, ...options }) {
  let filenames = null

  const span = tracer.startSpan('glob')

  const init = once(async () => {
    span.addEvent('init')
    filenames = await promisify(globFn)(pattern, options)
  })

  const stream = new Readable({
    objectMode: true,
    read: async () => {
      try {
        await init()

        if (filenames.length === 0) {
          return stream.push(null)
        }

        if (!stream.push(filenames.shift())) {
          return
        }

        stream._read()
      } catch (err) {
        span.recordException(err)
        span.setStatus({ code: SpanStatusCode.ERROR, message: err.message })
        stream.destroy(err)
      } finally {
        span.end()
      }
    }
  })

  return stream
}

export default glob
