import { Duplex } from 'stream'

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
export async function * chunkBySize({ env }, size, iterable) {
  for await (const array of chunkObjectsBySize(size, iterable)) {
    const batch = env.dataset()
    for (const dataset of array) {
      batch.addAll(dataset)
    }
    yield batch
  }
}

export const batch = function (size) {
  return Duplex.from(iterable => chunkBySize(this, Number(size), iterable))
}
