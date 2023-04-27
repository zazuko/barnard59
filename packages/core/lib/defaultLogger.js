import winston from 'winston'

const { createLogger, format, transports } = winston
const { Console, File } = transports

function factory({ console = true, errorFilename = null, filename = null, level = 'error' } = {}) {
  const transports = []

  if (console) {
    transports.push(new Console({
      format: format.combine(
        format.colorize(),
        format.simple(),
      ),
    }))
  }

  if (errorFilename) {
    transports.push(new File({ filename: errorFilename, level: 'error' }))
  }

  if (filename) {
    transports.push(new File({ filename }))
  }

  return createLogger({
    level,
    format: format.combine(
      format.timestamp(),
      format.errors({ stack: true }),
      format.splat(),
      format.json(),
    ),
    transports,
  })
}

export default factory
