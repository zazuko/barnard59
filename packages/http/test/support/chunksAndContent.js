import { Readable } from 'readable-stream'

function chunksAndContent () {
  const chunks = []

  for (let i = 0; i < 1000; i++) {
    chunks.push(Buffer.from(i.toString()))
  }

  return {
    content: Buffer.concat(chunks).toString(),
    stream: Readable.from(chunks)
  }
}

export default chunksAndContent
