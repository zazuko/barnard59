import { strictEqual } from 'node:assert'
import defaultLogger from '../lib/defaultLogger.js'

describe('defaultLogger', function () {
  it('should be a function', function () {
    strictEqual(typeof defaultLogger, 'function')
  })

  it('should return a winston logger instance', function () {
    const logger = defaultLogger()

    strictEqual(typeof logger.error, 'function')
    strictEqual(typeof logger.info, 'function')
    strictEqual(typeof logger.log, 'function')
    strictEqual(typeof logger.warn, 'function')
  })
})
