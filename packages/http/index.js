const fetch = require('./lib/fetch')
const writableFetch = require('./lib/writableFetch')

function get (options) {
  return fetch(options)
}

function post (options) {
  return writableFetch(options)
}

module.exports = {
  fetch,
  writableFetch,
  get,
  post
}
