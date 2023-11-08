import { Readable, Duplex } from 'stream'
import { sort, compareOn, createStore } from 'external-merge-sort'
import rdf from '@zazuko/env-node'

async function write(chunk, filename) {
  await rdf.toFile(Readable.from(chunk), filename)
  return rdf.fromFile(filename)
}

export const sortRDF = key => {
  const comparer = compareOn(key)
  const store = createStore(write, '.nt')

  return Duplex.from(iterable => sort(iterable, { comparer, store, maxSize: 100000 }))
}
