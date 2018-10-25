const through = require('through2')

function map (func) {
  return through.obj(function (chunk, encoding, callback) {
    Promise.resolve().then(() => {
      return func(chunk, encoding)
    }).then((result) => {
      this.push(result)

      callback()
    }).catch(callback)
  })
}

module.exports = map
