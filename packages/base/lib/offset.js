const through = require('through2')

function offset (offset) {
  const t = through.obj(function (chunk, encoding, callback) {
    t.count++

    if (t.count > t.offset) {
      this.push(chunk)
    }

    callback()
  })

  t.offset = offset
  t.count = 0

  return t
}

module.exports = offset
