const run = require('../../lib/run')

module.exports = async function (pipe, out = '') {
  pipe.on('data', (chunk) => {
    out += chunk
  })

  await run(pipe)

  return out
}
