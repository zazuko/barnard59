const { Readable } = require('readable-stream')

class ArgsToStream extends Readable {
  constructor (args) {
    super({
      objectMode: true,
      read: () => {}
    })

    args.forEach(arg => this.push(arg))
    this.push(null)
  }

  static create () {
    return new ArgsToStream(Array.prototype.slice.call(arguments, 0))
  }
}

module.exports = ArgsToStream.create
