const nodifyFetch = require('nodeify-fetch')
const objectToReadable = require('./toReadable').object
const DuplexToReadable = require('./DuplexToReadable')

async function fetch (url, options = {}) {
  const response = await nodifyFetch(url, options)

  return new DuplexToReadable(response.body)
}

fetch.json = (url, options = {}) => {
  options.headers = options.headers || new Map()

  if (!options.headers.has('accepts')) {
    options.headers.set('accepts', 'application/json')
  }

  return nodifyFetch(url, options).then(res => res.json()).then(json => objectToReadable(json))
}

module.exports = fetch
