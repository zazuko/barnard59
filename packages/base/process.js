import { Transform } from 'readable-stream'

class StdOut extends Transform {
  _transform(chunk, encoding, callback) {
    process.stdout.write(chunk, encoding)

    callback(null, chunk)
  }
}

export function stdout() {
  return new StdOut()
}

export function stdin() {
  return process.stdin
}
