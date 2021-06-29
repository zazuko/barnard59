import { promisify } from 'util'
import { finished } from 'readable-stream'
import tracer from './tracer.js'

function run (pipeline, { end = false, resume = false } = {}) {
  return tracer.startSpan('run', async span => {
    if (end) {
      pipeline.stream.end()
    }

    if (resume) {
      pipeline.stream.resume()
    }

    await promisify(finished)(pipeline.stream)

    pipeline.logger.end()
    span.end()

    await new Promise(resolve => {
      pipeline.logger.on('finish', () => resolve())
    })
  })
}

export default run
