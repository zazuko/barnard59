import { Readable, Duplex } from 'stream'
import { sort, compareOn, createStore } from 'external-merge-sort'
import through2 from 'through2'

// generic enough to be moved to a separate utils package
const compositeComparer = (...comparers) => {
  return (x, y) => {
    for (const comparer of comparers) {
      const result = comparer(x, y)
      if (result !== 0) {
        return result
      }
    }
    return 0
  }
}

export function choose(quad) {
  const predicate = this.env.namedNode(this.variables.get('path'))
  const classNode = this.env.namedNode(this.variables.get('class'))
  if (predicate.equals(quad.predicate)) {
    return this.env.quad(quad.subject, quad.predicate, quad.object, quad.object)
  }
  if (classNode.equals(quad.object) && this.env.ns.rdf.type.equals(quad.predicate)) {
    return this.env.quad(quad.subject, quad.predicate, quad.object, quad.subject)
  }
}

export function sortByGraph(sortChunkSize) {
  const write = async (chunk, filename) => {
    await this.env.toFile(Readable.from(chunk), filename)
    return this.env.fromFile(filename)
  }

  const comparer = compositeComparer(
    compareOn(quad => quad.graph.value),
    compareOn(quad => this.env.ns.rdf.type.equals(quad.predicate) ? 0 : 1))

  const store = createStore(write, '.nt')
  const maxSize = Number(sortChunkSize)

  const stream = Duplex.from(iterable => sort(iterable, { comparer, store, maxSize }))
  stream.on('finish', store.dispose)
  stream.on('error', store.dispose)
  return stream
}

export function check() {
  const a = this.env.ns.rdf.type
  const t = through2.obj(function (chunk, _encoding, callback) {
    if (chunk.predicate.equals(a)) {
      t.current = chunk
    } else if (!chunk.object.equals(t.current?.subject)) {
      this.push(chunk)
    }
    callback()
  })

  return t
}
