import { Readable } from 'readable-stream'

function error () {
  const stream = new Readable({
    read: () => {
      stream.destroy(new Error('test'))
    }
  })

  return stream
}

export default error
