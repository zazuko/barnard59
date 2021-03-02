function chunksAndContent () {
  const chunks = []

  for (let i = 0; i < 1000; i++) {
    chunks.push(Buffer.from(i.toString()))
  }

  return {
    chunks,
    content: Buffer.concat(chunks).toString()
  }
}

export default chunksAndContent
