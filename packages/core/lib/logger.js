const Transform = require('readable-stream').Transform

const levels = [ 'trace', 'debug', 'info', 'warn', 'error', 'fatal' ]

class Logger extends Transform {
  constructor (node, { master } = {}) {
    super({
      objectMode: true
    })

    this.node = node.term.value
    if (master) {
      this.pipe(master, { end: false })
    }

    levels.forEach((lvl) => {
      this[lvl] = (message, details) => {
        this.writeLog(lvl, message, details)
      }
    })
  }

  writeLog (level, message, { name, ...details } = {}) {
    this.push({
      stack: [this.node],
      level: level.toUpperCase(),
      name,
      details,
      message
    })
  }

  _transform (chunk, encoding, next) {
    chunk.stack.push(this.node)
    this.push(chunk)
    next()
  }
}

module.exports = Logger
