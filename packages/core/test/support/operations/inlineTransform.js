import stream from 'readable-stream'

const { Transform } = stream

class InlineTransformer extends Transform {
  constructor(func) {
    super({ objectMode: true })

    this.transform = func
  }

  _transform(chunk, encoding, callback) {
    callback(null, this.transform(chunk))
  }
}

function factory(func) {
  return new InlineTransformer(func)
}

export default factory
