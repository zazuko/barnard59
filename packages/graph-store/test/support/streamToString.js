const { finished } = require('readable-stream')
const { promisify } = require('util')

function streamToString (stream) {
  const chunks = []

  stream.on('data', chunk => chunks.push(chunk))

  return promisify(finished)(stream).then(() => {
    return Buffer.concat(chunks).toString()
  })
}

module.exports = streamToString
