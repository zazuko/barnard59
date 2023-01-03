import { createPipeline, defaultLogger, run } from 'barnard59-core'
import ns from './lib/namespaces.js'

import tracer from './lib/tracer.js'

function create (ptr, { basePath, outputStream, logger, variables = new Map(), level = 'error' } = {}) {
  function logVariable (value, key) {
    const isSensitive = !!ptr.any()
      .has(ns.rdf.type, ns.p.Variable)
      .has(ns.p.name, key)
      .has(ns.p.sensitive, true)
      .term

    logger.info(`  ${key}: ${isSensitive ? '***' : value}`, { iri: ptr.value })
  }

  return tracer.startActiveSpan('createPipeline', { 'pipeline.id': ptr.value }, async span => {
    try {
      if (!logger) {
        logger = defaultLogger({ level })
      }

      logger.info('variables via runner:', { iri: ptr.value })

      variables.forEach(logVariable)

      const pipeline = createPipeline(ptr, {
        basePath,
        logger,
        variables
      })

      await pipeline.init()

      logger.info('variables in pipeline instance:', { iri: ptr.value })

      pipeline.variables.forEach(logVariable)

      pipeline.stream.pipe(outputStream)

      const finished = run(pipeline)

      return {
        finished,
        pipeline
      }
    } finally {
      span.end()
    }
  })
}

export default create
