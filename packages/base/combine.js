import duplexify from 'duplexify'

function combine (streams, options) {
  if (streams.length === 0) {
    throw new Error('no streams to combine')
  }

  if (streams.length === 1) {
    return streams[0]
  }

  for (let index = 0; index < streams.length - 1; index++) {
    streams[index].pipe(streams[index + 1])
  }

  return duplexify(streams[0], streams[streams.length - 1], options)
}

export default combine
