import { Transform } from 'node:stream'

function error() {
  const stream = new Transform({
    transform: () => {
      stream.destroy(new Error('test'))
    },
  })

  return stream
}

export default error
