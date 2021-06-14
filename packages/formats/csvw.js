import sinkToDuplex from '@rdfjs/sink-to-duplex'
import rdf from 'rdf-ext'
import CsvwParser from 'rdf-parser-csvw'
import tracer from './tracer.js'

function toDataset (streamOrDataset) {
  if (!streamOrDataset.readable) {
    return Promise.resolve(streamOrDataset)
  }

  return rdf.dataset().import(streamOrDataset)
}

function parse (args) {
  let metadata
  let relaxColumnCount = false
  let skipLinesWithError = false
  let timezone = 'local'

  if (args.metadata) {
    metadata = args.metadata

    if (typeof args.relaxColumnCount !== 'undefined') {
      relaxColumnCount = Boolean(args.relaxColumnCount)
    }

    if (typeof args.skipLinesWithError !== 'undefined') {
      skipLinesWithError = Boolean(args.skipLinesWithError)
    }

    if (typeof args.timezone !== 'undefined') {
      timezone = args.timezone
    }
  } else {
    metadata = args
  }

  return tracer.startActiveSpan('csvw:parse', async span => {
    try {
      const dataset = await toDataset(metadata)
      span.addEvent('metadata')
      return sinkToDuplex(new CsvwParser({
        metadata: dataset,
        relaxColumnCount,
        skipLinesWithError,
        timezone
      }), {
        readableObjectMode: true
      })
    } finally {
      span.end()
    }
  })
}

export {
  parse
}
