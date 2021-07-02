import toReadable from 'duplex-to/readable.js'
import nodeFetch from 'node-fetch'

async function fetch ({ method = 'GET', url, ...options } = {}) {
  const response = await nodeFetch(url, { method, ...options })

  return toReadable(response.body)
}

export default fetch
