const through = require('through2')

function filter (func) {
  return through.obj(function (chunk, encoding, callback) {
    Promise.resolve().then(() => {
      return func(chunk, encoding)
    }).then((result) => {
      if (result) {
        this.push(chunk)
      }

      callback()
    }).catch(callback)
  })
}

module.exports = filter
