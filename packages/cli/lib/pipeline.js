import { dirname, resolve } from 'path'
import fromStream from 'rdf-dataset-ext/fromStream.js'
import rdf from '@zazuko/env'
import fromFile from 'rdf-utils-fs/fromFile.js'
import findPipeline from '../findPipeline.js'

async function fileToDataset(filename) {
  return fromStream(rdf.dataset(), fromFile(filename))
}

export async function parse(filename, iri) {
  const dataset = await fileToDataset(filename)
  const ptr = findPipeline(dataset, iri)

  return {
    basePath: resolve(dirname(filename)),
    ptr,
  }
}
