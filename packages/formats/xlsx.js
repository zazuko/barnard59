import sinkToDuplex from '@rdfjs/sink-to-duplex'
import CsvwXlsxParser from 'rdf-parser-csvw-xlsx'
import tracer from './lib/tracer.js'
import { toDataset } from './lib/stream.js'

function parse(args) {
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
      const dataset = await toDataset(this.env, metadata)
      span.addEvent('metadata')
      return sinkToDuplex(new CsvwXlsxParser({
        factory: this.env,
        metadata: dataset,
        timezone,
      }), {
        readableObjectMode: true,
      })
    } finally {
      span.end()
    }
  })
}

export {
  parse,
}
