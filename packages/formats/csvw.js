import sinkToDuplex from '@rdfjs/sink-to-duplex'
import CsvwParser from '@zazuko/rdf-parser-csvw'
import tracer from './lib/tracer.js'
import { toDataset } from './lib/stream.js'

/**
 * @typedef {{
 *   metadata: import('@rdfjs/types').DatasetCore
 *   timezone?: string
 *   relaxColumnCount?: boolean
 *   skipLinesWithError?: boolean
 *   trimHeaders?: boolean
 *   skipEmptyLines?: boolean
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
   * @type {import('@rdfjs/types').DatasetCore}
   */
  let metadata
  let relaxColumnCount = false
  let skipLinesWithError = false
  let timezone = 'local'
  let trimHeaders = true
  /**
   * @type {Boolean | undefined}
   */
  let skipEmptyLines

  if ('metadata' in args) {
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

    if (typeof args.trimHeaders !== 'undefined') {
      trimHeaders = Boolean(args.trimHeaders)
    }

    if (typeof args.skipEmptyLines !== 'undefined') {
      skipEmptyLines = Boolean(args.skipEmptyLines)
    }
  } else {
    metadata = args
  }

  return tracer.startActiveSpan('csvw:parse', async span => {
    try {
      const dataset = await toDataset(this.env, metadata)
      span.addEvent('metadata')
      return sinkToDuplex(new CsvwParser({
        factory: this.env,
        metadata: dataset,
        relaxColumnCount,
        skipLinesWithError,
        timezone,
        trimHeaders,
        skipEmptyLines,
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
