import { Transform } from 'readable-stream'

class StdOut extends Transform {
  _transform (chunk, encoding, callback) {
    process.stdout.write(chunk, encoding)

    callback(null, chunk)
  }

  static create () {
    return new StdOut()
  }
}

const stdout = StdOut.create
export default stdout
