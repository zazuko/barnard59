import { createPipeline, defaultLogger, run } from 'barnard59-core'

async function create (ptr, { basePath, outputStream, logger, variables = new Map(), level = 'error' } = {}) {
  if (!logger) {
    logger = defaultLogger({ level })
  }

  logger.info('variables via runner:', { iri: ptr.value })

  for (const [key, value] of variables) {
    logger.info(`  ${key}: ${value}`, { iri: ptr.value })
  }

  const pipeline = createPipeline(ptr, {
    basePath,
    logger,
    variables
  })

  await pipeline.init()

  logger.info('variables in pipeline instance:', { iri: ptr.value })

  for (const [key, value] of pipeline.variables) {
    logger.info(`  ${key}: ${value}`, { iri: ptr.value })
  }

  pipeline.stream.pipe(outputStream)

  const finished = run(pipeline)

  return {
    finished,
    pipeline
  }
}

export default create
