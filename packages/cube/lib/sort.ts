import { Readable, Duplex } from 'node:stream'
import { sort, compareOn, createStore } from 'external-merge-sort'
import type { Context } from 'barnard59-core'
import type { Quad } from '@rdfjs/types'

export function sortBySubject(this: Context, sortChunkSize: string | number) {
  const write = async (chunk: Parameters<typeof Readable.from>[0], filename: string) => {
    await this.env.toFile(Readable.from(chunk), filename)
    return this.env.fromFile(filename)
  }

  const comparer = compareOn((x: Quad) => x.subject.value)
  const store = createStore(write, '.nt')
  const maxSize = Number(sortChunkSize)

  const stream = Duplex.from(iterable => sort(iterable, { comparer, store, maxSize }))
  stream.on('finish', store.dispose)
  stream.on('error', store.dispose)
  return stream
}
