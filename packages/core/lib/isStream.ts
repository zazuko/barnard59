import {
  isReadableStream as isReadable,
  isWritableStream as isWritable,
  isDuplexStream as isDuplex,
} from 'is-stream'
import { Stream, Writable } from 'readable-stream'

const isReadableObjectMode = (stream: Stream) => isReadable(stream) && stream._readableState.objectMode
const isWritableObjectMode = (stream: Stream) => isWritable(stream) && (stream as Writable)._writableState.objectMode

export { isStream } from 'is-stream'
export {
  isReadable,
  isReadableObjectMode,
  isWritable,
  isWritableObjectMode,
  isDuplex,
}
