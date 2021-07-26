import { SpanStatusCode } from '@opentelemetry/api'
import Parser from '@rdfjs/parser-jsonld'
import Serializer from '@rdfjs/serializer-jsonld'
import sinkToDuplex from '@rdfjs/sink-to-duplex'
import { combine, jsonStringify } from 'barnard59-base'
import tracer from './lib/tracer.js'

function parse () {
  return tracer.startActiveSpan('jsonld:parse', span => {
    const stream = sinkToDuplex(new Parser(), { objectMode: true })
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
    const stream = combine([jsonStringify(), parse()], { objectMode: true })
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

function serialize () {
  return sinkToDuplex(new Serializer(), { objectMode: true })
}

export { parse, parseObject, serialize }
