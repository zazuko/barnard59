import stream from 'readable-stream'

const { Readable } = stream

class ArgsToStream extends Readable {
  constructor (args) {
    super({
      objectMode: true,
      read: () => {}
    })

    args.forEach(arg => this.push(arg))
    this.push(null)
  }
}

function factory () {
  return new ArgsToStream(Array.prototype.slice.call(arguments, 0))
}

export default factory
