import { promisify } from 'util'
import { SpanStatusCode } from '@opentelemetry/api'
import globFn from 'glob'
import onetime from 'onetime'
import { Readable } from 'readable-stream'
import tracer from './lib/tracer.js'

function glob({ pattern, ...options }) {
  const { logger } = this
  let filenames = null

  const span = tracer.startSpan('glob')

  const init = onetime(async () => {
    span.addEvent('init')
    filenames = await promisify(globFn)(pattern, options)
    return filenames.length === 0
  })

  const stream = new Readable({
    objectMode: true,
    read: async () => {
      try {
        const noneMatched = await init()

        if (filenames.length === 0) {
          if (noneMatched) {
            logger.warn(`No files matched by glob '${pattern}'`)
          }
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
    },
  })

  return stream
}

export default glob
