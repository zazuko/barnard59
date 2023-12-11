import { Readable, Writable, Duplex } from 'readable-stream'
import Pipeline from '../Pipeline.js'
import StreamObject from '../StreamObject.js'
import { isWritable as streamIsWritable } from '../isStream.js'

export function isWritable(arg: StreamObject): arg is StreamObject<Writable> {
  return streamIsWritable(arg.stream)
}

export function assertWritable(arg: StreamObject): asserts arg is StreamObject<Writable> {
  if (!isWritable(arg)) {
    throw new Error('Stream is not writable')
  }
}

type Arg = Pick<Pipeline, 'readable' | 'readableObjectMode' | 'read' | 'writable' | 'writableObjectMode' | 'write' | 'final'>

function createStream({ readable, readableObjectMode, read, writable, writableObjectMode, write, final }: Arg) {
  if (readable && writable) {
    return new Duplex({
      readableObjectMode,
      writableObjectMode,
      read,
      write,
      final,
    })
  }

  if (readable) {
    return new Readable({
      objectMode: readableObjectMode,
      read,
    })
  }

  if (writable) {
    return new Writable({
      objectMode: writableObjectMode,
      write,
      final,
    })
  }

  // dummy, just for the events
  return new Readable({ read })
}

export default createStream
