import * as winston from 'winston'

const { createLogger, format, transports } = winston
const { Console, File } = transports

const levels = {
  error: 0,
  warn: 1,
  info: 2,
  verbose: 3,
  debug: 4,
  trace: 5,
}

declare module 'winston' {
  export interface Logger {
    error: winston.LeveledLogMethod
    warn: winston.LeveledLogMethod
    info: winston.LeveledLogMethod
    verbose: winston.LeveledLogMethod
    debug: winston.LeveledLogMethod
    trace: winston.LeveledLogMethod
  }
}

function factory({ console = true, errorFilename = null, filename = null, level = 'error', quiet = false } = {}) {
  const transports = []

  if (console) {
    transports.push(new Console({
      consoleWarnLevels: Object.keys(levels),
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

  winston.addColors({
    trace: 'blue',
  })
  return createLogger({
    levels,
    level,
    format: format.combine(
      format.timestamp(),
      format.errors({ stack: true }),
      format.splat(),
      format.json(),
    ),
    transports,
    silent: quiet,
  })
}

export default factory