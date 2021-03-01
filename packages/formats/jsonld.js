import { combine, jsonStringify } from 'barnard59-base'
import sinkToDuplex from '@rdfjs/sink-to-duplex'
import Parser from '@rdfjs/parser-jsonld'
import Serializer from '@rdfjs/serializer-jsonld'

export function parse () {
  return sinkToDuplex(new Parser(), { objectMode: true })
}

export const parseObject = () => {
  return combine([jsonStringify(), parse()], { objectMode: true })
}

parse.object = parseObject

export function serialize () {
  return sinkToDuplex(new Serializer(), { objectMode: true })
}
