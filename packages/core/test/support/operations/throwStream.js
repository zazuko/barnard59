import stream from 'node:stream'

const { Readable } = stream

function factory() {
  const stream = new Readable({
    read: () => {
      throw new Error('test')
    },
  })

  return stream
}

export default factory
