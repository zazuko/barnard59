import { parsers } from '@rdfjs/formats-common'
import { createReadStream } from 'fs'
import { dataset } from 'rdf-ext'
import { string as stringToReadable } from './toReadable.js'

export function fileToDataset (mediaType, filename) {
  return dataset().import(parsers.import(mediaType, createReadStream(filename)))
}

export function stringToDataset (mediaType, string) {
  return dataset().import(parsers.import(mediaType, stringToReadable(string)))
}
