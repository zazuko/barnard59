import { obj } from 'through2'

export default function offset (offset) {
  const t = obj(function (chunk, encoding, callback) {
    t.count++

    if (t.count > t.offset) {
      this.push(chunk)
    }

    callback()
  })

  t.offset = offset
  t.count = 0

  return t
}
