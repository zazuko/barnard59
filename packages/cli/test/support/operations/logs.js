import { Readable } from 'readable-stream'

export default function () {
  this.logger.trace('test trace')
  this.logger.debug('test debug')
  this.logger.verbose('test verbose')
  this.logger.info('test info')
  this.logger.warn('test warn')
  this.logger.error('test error')

  return new Readable({
    read() {
      this.push('')
      this.push(null)
    },
  })
}
