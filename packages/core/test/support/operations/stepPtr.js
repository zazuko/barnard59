import stream from 'readable-stream'

const { Readable } = stream

function factory() {
  const stream = new Readable({
    read: () => {
      stream.push(stream.step.ptr.value)
      stream.push(null)
    },
  })

  return stream
}

export default factory
