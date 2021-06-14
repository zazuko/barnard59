import { SpanStatusCode } from '@opentelemetry/api'
import toReadable from 'duplex-to/readable.js'
import nodeFetch from 'node-fetch'
import tracer from './tracer.js'

async function fetch ({ method = 'GET', url, ...options } = {}) {
  return await tracer.startActiveSpan('fetch', async span => {
    try {
      const response = await nodeFetch(url, { method, ...options })

      return toReadable(response.body)
    } catch (e) {
      span.recordException(e)
      span.setStatus({ code: SpanStatusCode.ERROR, message: e.message })
    } finally {
      span.end()
    }
  })
}

export default fetch
