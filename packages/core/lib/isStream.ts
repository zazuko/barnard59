import type { Duplex, Readable, Writable } from 'node:stream'
import {
  isReadableStream as isReadable,
  isWritableStream as isWritable,
  isDuplexStream as isDuplex,
} from 'is-stream'

export type AnyStream = Duplex | Readable | Writable

interface HasReadableState {
  _readableState?: {
    objectMode?: boolean
  }
}

interface HasWritableState {
  _writableState?: {
    objectMode?: boolean
  }
}

const isReadableObjectMode = (stream: AnyStream) => isReadable(stream) && (stream as HasReadableState)._readableState?.objectMode
const isWritableObjectMode = (stream: AnyStream) => isWritable(stream) && (stream as HasWritableState)._writableState?.objectMode

export { isStream } from 'is-stream'
export {
  isReadable,
  isReadableObjectMode,
  isWritable,
  isWritableObjectMode,
  isDuplex,
}
