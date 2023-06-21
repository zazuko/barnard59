import streams from 'readable-stream'

const { Duplex, Readable, Writable } = streams

function createStream({ readable, readableObjectMode, read, writable, writableObjectMode, write, final }) {
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
