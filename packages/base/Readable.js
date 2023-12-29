import Readable from 'readable-stream'

export function from(...array) {
  return Readable.from(array)
}
