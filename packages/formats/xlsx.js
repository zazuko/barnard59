import sinkToDuplex from '@rdfjs/sink-to-duplex'
import rdf from 'rdf-ext'
import CsvwXlsxParser from 'rdf-parser-csvw-xlsx'
import tracer from './lib/tracer.js'

function toDataset (streamOrDataset) {
  if (!streamOrDataset.readable) {
    return Promise.resolve(streamOrDataset)
  }

  return rdf.dataset().import(streamOrDataset)
}

function parse (args) {
  let metadata
  let timezone = 'local'

  if (args.metadata) {
    metadata = args.metadata

    if (typeof args.timezone !== 'undefined') {
      timezone = args.timezone
    }
  } else {
    metadata = args
  }

  return tracer.startActiveSpan('xlsx:parse', async span => {
    try {
      const dataset = await toDataset(metadata)
      span.addEvent('metadata')
      return sinkToDuplex(new CsvwXlsxParser({
        metadata: dataset,
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
