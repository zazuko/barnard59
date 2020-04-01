const { promisify } = require('util')
const { finished } = require('readable-stream')
const p = require('..')
const TextLogStream = require('../lib/TextLogStream')

const log = p.log.extend('runner')
log.enabled = false

function create ({ dataset, term, basePath, outputStream, variable } = {}) {
  variable = variable || new Map()

  log('variables via CLI:')

  for (const [key, value] of variable) {
    log(`  ${key}: ${value}`)
  }

  const pipeline = p.pipeline(dataset, term, {
    basePath,
    variables: variable
  })

  log('variables in pipeline instance:')

  for (const [key, value] of pipeline.variables) {
    log(`  ${key}: ${value}`)
  }

  pipeline.pipe(outputStream)

  const logger = pipeline.context.log.pipe(new TextLogStream()).on('data', log)

  const promise = Promise.all([
    promisify(finished)(logger),
    p.run(pipeline)
  ])

  return {
    pipeline,
    promise
  }
}

module.exports = {
  create,
  log
}
