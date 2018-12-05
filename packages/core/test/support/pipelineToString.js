const run = require('../../lib/run')

module.exports = async function (pipe) {
  let out = ''
  pipe.on('data', (chunk) => {
    out += chunk
  })

  await run(pipe)

  return out
}
