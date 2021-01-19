const clownface = require('clownface-io')
const { PassThrough } = require('stream')
const { readable } = require('duplex-to')
const ns = require('@tpluscode/rdf-ns-builders')
const { fetch } = require('./protoFetch')

const json = /json$/i

function fetchMapping (csvw) {
  return async () => {
    const mappings = await clownface().namedNode(csvw).fetch({
      contentTypeLookup: (ext) => json.test(ext) ? 'application/ld+json' : undefined
    })

    const [failedFetch] = [...mappings.failures]
    if (failedFetch) {
      const [, errorDetails] = failedFetch
      throw errorDetails.error
    }

    return mappings
  }
}

function fetchDataFile (mappings) {
  const url = mappings.any().has(ns.csvw.url).out(ns.csvw.url).value
  return fetch(url)
}

function fetchCsv ({ csvw }) {
  const csvStream = new PassThrough()

  Promise.resolve()
    .then(fetchMapping(csvw))
    .then(fetchDataFile)
    .then(response => {
      response.body.pipe(csvStream)
    })
    .catch(error => {
      csvStream.emit('error', error)
    })

  return readable(csvStream)
}

module.exports = fetchCsv
