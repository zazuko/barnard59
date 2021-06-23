import Parser from '@rdfjs/parser-jsonld'
import Serializer from '@rdfjs/serializer-jsonld'
import sinkToDuplex from '@rdfjs/sink-to-duplex'
import { combine, jsonStringify } from 'barnard59-base'

function parse () {
  return sinkToDuplex(new Parser(), { objectMode: true })
}

const parseObject = () => {
  return combine([jsonStringify(), parse()], { objectMode: true })
}

parse.object = parseObject

function serialize () {
  return sinkToDuplex(new Serializer(), { objectMode: true })
}

export { parse, parseObject, serialize }
