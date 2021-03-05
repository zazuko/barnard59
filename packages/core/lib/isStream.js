import isStream from 'isstream'

const isReadable = isStream.isReadable
const isReadableObjectMode = stream => isReadable(stream) && stream._readableState.objectMode
const isWritable = isStream.isWritable
const isWritableObjectMode = stream => isWritable(stream) && stream._writableState.objectMode
const isDuplex = isStream.isDuplex

export {
  isStream,
  isReadable,
  isReadableObjectMode,
  isWritable,
  isWritableObjectMode,
  isDuplex
}
