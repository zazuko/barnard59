const run = require('../../lib/run')

async function streamToArray (pipeline) {
  const content = []

  pipeline.on('data', chunk => content.push(chunk))

  await run(pipeline)

  return content
}

module.exports = streamToArray
