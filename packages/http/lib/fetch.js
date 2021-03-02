import nodeFetch from 'node-fetch'
import DuplexToReadable from './DuplexToReadable.js'

async function fetch ({ method = 'GET', url, ...options } = {}) {
  const response = await nodeFetch(url, { method, ...options })

  return new DuplexToReadable(response.body)
}

export default fetch
