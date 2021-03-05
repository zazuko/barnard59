import { promisify } from 'util'
import { finished } from 'readable-stream'

async function run (pipeline, { end = false, resume = false } = {}) {
  if (end) {
    pipeline.stream.end()
  }

  if (resume) {
    pipeline.stream.resume()
  }

  await promisify(finished)(pipeline.stream)

  pipeline.logger.end()

  await new Promise(resolve => {
    pipeline.logger.on('finish', () => resolve())
  })
}

export default run
