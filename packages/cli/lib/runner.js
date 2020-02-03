const p = require('..')
const TextLogStream = require('../lib/TextLogStream')

const log = p.log.extend('runner')
log.enabled = false

function create ({ basePath, outputStream, pipeline, variable } = {}) {
  variable = variable || new Map()

  return function runner (dataset) {
    log('variables via CLI:')

    for (const [key, value] of variable) {
      log(`  ${key}: ${value}`)
    }

    const stream = p.pipeline(dataset, pipeline, {
      basePath,
      variables: variable
    })

    log('variables in pipeline instance:')

    for (const [key, value] of stream.variables) {
      log(`  ${key}: ${value}`)
    }

    stream.on('error', err => {
      throw err
    })

    stream.pipe(outputStream)

    stream.context.log.pipe(new TextLogStream()).on('data', log)

    return p.run(stream)
  }
}

module.exports = {
  create,
  log
}
