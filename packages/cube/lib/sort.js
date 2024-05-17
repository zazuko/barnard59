import { Readable, Duplex } from 'node:stream'
import { sort, compareOn, createStore } from 'external-merge-sort'

/**
 * @this {import('barnard59-core').Context}
 * @param {string | number} sortChunkSize
 */
export function sortBySubject(sortChunkSize) {
  /**
   * @param {string} filename
   * @param {ReturnType<Readable.from>} chunk
   * @returns {Promise<import('@rdfjs/types').Stream>}
   */
  const write = async (chunk, filename) => {
    await this.env.toFile(Readable.from(chunk), filename)
    return this.env.fromFile(filename)
  }

  const comparer = compareOn(x => x.subject.value)
  const store = createStore(write, '.nt')
  const maxSize = Number(sortChunkSize)

  const stream = Duplex.from(iterable => sort(iterable, { comparer, store, maxSize }))
  stream.on('finish', store.dispose)
  stream.on('error', store.dispose)
  return stream
}
