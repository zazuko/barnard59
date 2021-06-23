import { Transform } from 'readable-stream'

class StdOut extends Transform {
  _transform (chunk, encoding, callback) {
    process.stdout.write(chunk, encoding)

    callback(null, chunk)
  }
}

function factory () {
  return new StdOut()
}

export default factory
