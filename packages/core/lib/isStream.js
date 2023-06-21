import {
  isReadableStream as isReadable,
  isWritableStream as isWritable,
  isDuplexStream as isDuplex,
} from 'is-stream'

const isReadableObjectMode = stream => isReadable(stream) && stream._readableState.objectMode
const isWritableObjectMode = stream => isWritable(stream) && stream._writableState.objectMode

export { isStream } from 'is-stream'
export {
  isReadable,
  isReadableObjectMode,
  isWritable,
  isWritableObjectMode,
  isDuplex,
}
