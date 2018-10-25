const Readable = require('readable-stream')

class ToReadable extends Readable {
  constructor (content, { objectMode = false } = {}) {
    super({
      objectMode,
      read: () => {}
    })

    this.push(content)
    this.push(null)
  }
}

function stringToReadable (str) {
  return new ToReadable(str)
}

function objectToReadable (obj) {
  return new ToReadable(obj, { objectMode: true })
}

module.exports = {
  string: stringToReadable,
  object: objectToReadable
}
