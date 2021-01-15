const clownface = require('clownface-io')
const { contentType } = require('mime-types')
const { PassThrough } = require('stream')
const { readable } = require('duplex-to')
const ns = require('@tpluscode/rdf-ns-builders')
const { fetch } = require('./protoFetch')

const json = /json$/i

function fetchCsv ({ csvw }) {
  const csvStream = new PassThrough()

  Promise.resolve().then(async () => {
    const mappings = await clownface().namedNode(csvw).fetch({
      contentTypeLookup: (ext) => {
        return json.test(ext) ? 'application/ld+json' : contentType(ext)
      }
    })

    const url = mappings.any().has(ns.csvw.url).out(ns.csvw.url).value

    const response = await fetch(url)
    response.body.pipe(csvStream)
  })

  return readable(csvStream)
}

module.exports = fetchCsv
