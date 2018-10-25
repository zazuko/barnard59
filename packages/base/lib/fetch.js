const nodifyFetch = require('nodeify-fetch')
const objectToReadable = require('./toReadable').object

function fetch (url, options) {
  return nodifyFetch(url, options).then(res => res.body)
}

fetch.json = (url, options = {}) => {
  options.headers = options.headers || new Map()

  if (!options.headers.has('accepts')) {
    options.headers.set('accepts', 'application/json')
  }

  return nodifyFetch(url, options).then(res => res.json()).then(json => objectToReadable(json))
}

module.exports = fetch
