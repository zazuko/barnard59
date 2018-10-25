const through = require('through2')

function flatten () {
  return through.obj(function (chunk, encoding, callback) {
    chunk.forEach((item) => {
      this.push(item)
    })

    callback()
  })
}

module.exports = flatten
