function streamToString (stream) {
  const chunks = []

  stream.on('data', chunk => chunks.push(chunk))

  return new Promise(resolve => {
    stream.on('end', () => {
      resolve(Buffer.concat(chunks).toString())
    })
  })
}

module.exports = streamToString
