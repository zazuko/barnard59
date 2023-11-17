import { Readable, Duplex } from 'stream'
import { sort, compareOn, createStore } from 'external-merge-sort'

export function sortRDF(key) {
  const write = async (chunk, filename) => {
    await this.rdf.toFile(Readable.from(chunk), filename)
    return this.rdf.fromFile(filename)
  }

  const comparer = compareOn(key)
  const store = createStore(write, '.nt')

  return Duplex.from(iterable => sort(iterable, { comparer, store, maxSize: 100000 }))
}
