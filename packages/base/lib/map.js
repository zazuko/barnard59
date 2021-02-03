const through = require('through2')

function map (func) {
  const context = this
  return through.obj(function (chunk, encoding, callback) {
    Promise.resolve().then(() => {
      return func.call(context, chunk, encoding)
    }).then((result) => {
      this.push(result)

      callback()
    }).catch(callback)
  })
}

module.exports = map
