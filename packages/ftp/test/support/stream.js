const stream = require('readable-stream')
const { promisify } = require('util')

const finished = promisify(stream.finished)

module.exports = {
  finished
}
