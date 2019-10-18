const writableFetch = require('./lib/writableFetch')

function post ({ endpoint, user, password }) {
  return writableFetch({
    endpoint,
    method: 'POST',
    user,
    password
  })
}

function put ({ endpoint, user, password }) {
  return writableFetch({
    endpoint,
    method: 'PUT',
    user,
    password
  })
}

module.exports = {
  post,
  put
}
