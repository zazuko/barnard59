import { createPipeline, defaultLogger, run } from 'barnard59-core'

import tracer from './lib/tracer.js'

function create(ptr, { basePath, outputStream, logger, variables = new Map(), level = 'error' } = {}) {
  return tracer.startActiveSpan('createPipeline', { 'pipeline.id': ptr.value }, async span => {
    try {
      if (!logger) {
        logger = defaultLogger({ level })
      }

      const pipeline = createPipeline(ptr, {
        basePath,
        logger,
        variables,
      })

      await pipeline.init()

      pipeline.stream.pipe(outputStream)

      const finished = run(pipeline)

      return {
        finished,
        pipeline,
      }
    } finally {
      span.end()
    }
  })
}

export default create
