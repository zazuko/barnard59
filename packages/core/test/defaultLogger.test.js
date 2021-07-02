import { strictEqual } from 'assert'
import { describe, it } from 'mocha'
import defaultLogger from '../lib/defaultLogger.js'

describe('defaultLogger', () => {
  it('should be a function', () => {
    strictEqual(typeof defaultLogger, 'function')
  })

  it('should return a winston logger instance', () => {
    const logger = defaultLogger()

    strictEqual(typeof logger.error, 'function')
    strictEqual(typeof logger.info, 'function')
    strictEqual(typeof logger.log, 'function')
    strictEqual(typeof logger.warn, 'function')
  })
})
