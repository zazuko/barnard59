const p = require('..')
const TextLogStream = require('../lib/TextLogStream')

function create ({ basePath, outputStream, pipeline, variable, verbose, log } = {}) {
  log = log || function () { }

  return function runner (dataset) {
    if (verbose) {
      log('variables via CLI:\n')

      for (const [key, value] of variable) {
        log(`  ${key}: ${value}\n`)
      }
    }

    const stream = p.pipeline(dataset, pipeline, {
      basePath,
      variables: variable
    })

    if (verbose) {
      log('variables in pipeline instance:\n')

      for (const [key, value] of stream.variables) {
        log(`  ${key}: ${value}\n`)
      }
    }

    stream.on('error', err => {
      throw err
    })

    stream.pipe(outputStream)

    if (verbose) {
      stream.context.log.pipe(new TextLogStream()).pipe(log)
    }

    return p.run(stream)
  }
}

module.exports = {
  create
}
