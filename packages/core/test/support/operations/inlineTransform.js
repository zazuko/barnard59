const stream = require('readable-stream')

class InlineTransformer extends stream.Transform {
  constructor (func) {
    super({ objectMode: true })

    this.transform = func
  }

  _transform (chunk, e, next) {
    this.push(this.transform(chunk))
    next()
  }
}

module.exports = (fun) => {
  return new InlineTransformer(fun)
}
