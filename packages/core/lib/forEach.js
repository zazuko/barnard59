const pipeline = require('./pipeline')
const Readable = require('readable-stream').Readable
const Transform = require('readable-stream').Transform

class ObjectToReadable extends Readable {
  constructor (content) {
    super({
      objectMode: true,
      read: () => {}
    })

    this.push(content)
    this.push(null)
  }
}

class ForEach extends Transform {
  constructor (node, master) {
    super({ objectMode: true })

    this.node = node
    this.master = master
  }

  _transform (chunk, encoding, callback) {
    const item = new ObjectToReadable(chunk)
    const current = pipeline(this.node._context[0].dataset, {
      iri: this.node.term,
      basePath: this.master.basePath,
      context: this.master.context,
      variables: this.master.variables,
      objectMode: true
    })

    current.on('error', err => callback(err))

    current.init().then(() => {
      item.pipe(current.streams[0])
    }).catch(err => this.emit('error', err))

    current.on('data', chunk => this.push(chunk))
    current.on('end', () => callback())
    current.on('error', err => callback(err))
  }

  static create (node) {
    return new ForEach(node, this.pipeline)
  }
}

module.exports = ForEach.create
