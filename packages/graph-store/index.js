const writableFetch = require('./lib/writableFetch')

function put ({ endpoint }) {
  return writableFetch({
    endpoint,
    method: 'PUT'
  })
}

module.exports = {
  put
}
