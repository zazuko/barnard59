const writableFetch = require('./lib/writableFetch')

function put ({ endpoint, user, password }) {
  return writableFetch({
    endpoint,
    method: 'PUT',
    user,
    password
  })
}

module.exports = {
  put
}
