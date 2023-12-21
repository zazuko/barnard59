import { Transform } from 'stream'

function batch(size = 0) {
  let array = []
  const maxSize = Number(size)
  return new Transform({
    readableObjectMode: true,
    writableObjectMode: true,
    readableHighWaterMark: maxSize,
    writableHighWaterMark: maxSize,
    transform(item, _encoding, callback) {
      array.push(item)
      if (array.length === maxSize) {
        this.push(array)
        array = []
      }
      callback()
    },
    flush(callback) {
      if (array.length > 0) this.push(array)
      callback()
    },
  })
}

export default batch
