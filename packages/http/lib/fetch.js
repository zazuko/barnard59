const nodeFetch = require('node-fetch')
const DuplexToReadable = require('./DuplexToReadable')

async function fetch ({ method = 'GET', url, ...options } = {}) {
  const response = await nodeFetch(url, { method, ...options })

  return new DuplexToReadable(response.body)
}

module.exports = fetch
