import duplexify from 'duplexify'
import nodeFetch from 'node-fetch'
import { PassThrough } from 'readable-stream'
import tracer from './tracer.js'

async function fetch ({ method = 'POST', url, ...options } = {}) {
  const inputStream = new PassThrough()
  const outputStream = new PassThrough()

  tracer.startActiveSpan('writableFetch', span => setTimeout(async () => {
    try {
      const response = await nodeFetch(url, { method, body: inputStream, ...options })

      response.body.pipe(outputStream)
    } catch (err) {
      outputStream.emit('error', err)
    } finally {
      span.end()
    }
  }, 0))

  return duplexify(inputStream, outputStream)
}

export default fetch
