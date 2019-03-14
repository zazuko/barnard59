const nodifyFetch = require('nodeify-fetch')
const objectToReadable = require('./toReadable').object

async function fetch (url, options = {}) {
  const response = await nodifyFetch(url, options)

  // patch the writable interface away
  response.body._write = null
  response.body._writableState = null

  return response.body
}

fetch.json = (url, options = {}) => {
  options.headers = options.headers || new Map()

  if (!options.headers.has('accepts')) {
    options.headers.set('accepts', 'application/json')
  }

  return nodifyFetch(url, options).then(res => res.json()).then(json => objectToReadable(json))
}

module.exports = fetch
