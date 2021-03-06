import stream from 'readable-stream'

const { Readable } = stream

function factory () {
  const stream = new Readable({
    read: () => {
      throw new Error('test')
    }
  })

  return stream
}

export default factory
