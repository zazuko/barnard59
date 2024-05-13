import { SpanStatusCode } from '@opentelemetry/api'
import Parser from '@rdfjs/parser-jsonld'
import FsDocumentLoader from '@rdfjs/parser-jsonld/FsDocumentLoader.js'
import Serializer from '@rdfjs/serializer-jsonld'
import sinkToDuplex from '@rdfjs/sink-to-duplex'
import { combine, jsonStringify } from 'barnard59-base'
import tracer from './lib/tracer.js'

function parse({ localContext } = {}) {
  let documentLoader = null

  if (localContext) {
    if (typeof localContext === 'string') {
      localContext = JSON.parse(localContext)
    }

    documentLoader = new FsDocumentLoader(localContext)
  }

  return tracer.startActiveSpan('jsonld:parse', span => {
    const stream = sinkToDuplex(new Parser({ factory: this.env, documentLoader }), { objectMode: true })
    stream.on('error', err => {
      span.recordException(err)
      span.setStatus({ code: SpanStatusCode.ERROR, message: err.message })
      span.end()
    })
    stream.on('finish', () => span.end())
    return stream
  })
}

const parseObject = () => {
  return tracer.startActiveSpan('jsonld:parse.object', span => {
    const stream = combine([jsonStringify(), parse.call(this)], { objectMode: true })
    stream.on('error', err => {
      span.recordException(err)
      span.setStatus({ code: SpanStatusCode.ERROR, message: err.message })
      span.end()
    })
    stream.on('finish', () => span.end())
    return stream
  })
}

parse.object = parseObject

function serialize() {
  return sinkToDuplex(new Serializer(), { objectMode: true })
}

export { parse, parseObject, serialize }
