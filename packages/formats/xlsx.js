import sinkToDuplex from '@rdfjs/sink-to-duplex'
import CsvwXlsxParser from '@zazuko/rdf-parser-csvw-xlsx'
import tracer from './lib/tracer.js'
import { toDataset } from './lib/stream.js'

/**
 * @typedef {{
 *  metadata: import('@rdfjs/types').DatasetCore
 *  timezone?: string
 * }} Options
 */

/**
 * @overload
 * @param {Options} args
 * @return {import('duplexify').Duplexify}
 */

/**
 * @overload
 * @param {import('@rdfjs/types').DatasetCore} metadata
 * @return {import('duplexify').Duplexify}
 */

/**
 * @this {import('barnard59-core').Context}
 * @param {Options | import('@rdfjs/types').DatasetCore} args
 */
function parse(args) {
  /**
   * @type {import('rdf-js').DatasetCore}
   */
  let metadata
  let timezone = 'local'

  if ('metadata' in args) {
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
