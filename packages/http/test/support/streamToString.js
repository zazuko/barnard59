import { finished } from 'readable-stream'
import { promisify } from 'util'

function streamToString (stream) {
  const chunks = []

  stream.on('data', chunk => chunks.push(chunk))

  return promisify(finished)(stream).then(() => {
    return Buffer.concat(chunks).toString()
  })
}

export default streamToString
