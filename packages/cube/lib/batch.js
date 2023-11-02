import { Duplex } from 'stream'
import rdf from '@zazuko/env-node'

// Iterable<X> => Iterable<X[]>
export async function * chunkObjectsBySize(size, iterable) {
  let chunk = []
  for await (const item of iterable) {
    chunk.push(item)
    if (chunk.length === size) {
      yield chunk
      chunk = []
    }
  }
  if (chunk.length > 0) {
    yield chunk
  }
}

// Iterable<Dataset> => Iterable<Dataset>
export async function * chunkBySize(size, iterable) {
  for await (const array of chunkObjectsBySize(size, iterable)) {
    const batch = rdf.dataset()
    for (const dataset of array) {
      batch.addAll(dataset)
    }
    yield batch
  }
}

export const batch = size => Duplex.from(iterable => chunkBySize(Number(size), iterable))
