import { createPipeline, defaultLogger, run } from 'barnard59-core'

import tracer from './lib/tracer.js'

/**
 * @param {{ term?: import('@rdfjs/types').Term, dataset?: import('@rdfjs/types').DatasetCore, value?: string }} ptr
 * @param {import('barnard59-env').Environment} env
 * @param {object} options
 * @param {string} options.basePath
 * @param {import('stream').Writable} options.outputStream
 * @param {import('winston').Logger} [options.logger]
 * @param {Map<string, unknown>} [options.variables]
 * @param {import('barnard59-core/lib/defaultLogger.js').LogLevels} [options.level]
 * @param {boolean} [options.quiet]
 */
function create(ptr, env, { basePath, outputStream, logger, variables = new Map(), level = 'error', quiet }) {
  return tracer.startActiveSpan('createPipeline', { attributes: { 'pipeline.id': ptr.value } }, async span => {
    try {
      if (!logger) {
        logger = defaultLogger({ level, quiet })
      }

      const pipeline = createPipeline(ptr, {
        env,
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
