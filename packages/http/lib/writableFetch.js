import duplexify from 'duplexify'
import nodeFetch from 'node-fetch'
import { PassThrough } from 'readable-stream'

async function fetch ({ method = 'POST', url, ...options } = {}) {
  const inputStream = new PassThrough()
  const outputStream = new PassThrough()

  setTimeout(async () => {
    try {
      const response = await nodeFetch(url, { method, body: inputStream, ...options })

      response.body.pipe(outputStream)
    } catch (err) {
      outputStream.emit('error', err)
    }
  }, 0)

  return duplexify(inputStream, outputStream)
}

export default fetch
