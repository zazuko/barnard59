import type { Duplex, Readable, Writable } from 'node:stream'
import {
  isReadableStream as isReadable,
  isWritableStream as isWritable,
  isDuplexStream as isDuplex,
} from 'is-stream'

export type AnyStream = Duplex | Readable | Writable

const isReadableObjectMode = (stream: AnyStream) => isReadable(stream) && stream.readableObjectMode
const isWritableObjectMode = (stream: AnyStream) => isWritable(stream) && stream.writableObjectMode

export { isStream } from 'is-stream'
export {
  isReadable,
  isReadableObjectMode,
  isWritable,
  isWritableObjectMode,
  isDuplex,
}
