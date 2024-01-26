import { Transform } from 'readable-stream'
import oxigraph from 'oxigraph'

export const update = sparql =>
  new Transform({
    objectMode: true,
    transform: (chunk, encoding, callback) => {
      const store = new oxigraph.Store([...chunk])
      store.update(sparql)
      callback(null, store.match())
    },
  })

export const query = sparql =>
  new Transform({
    objectMode: true,
    transform: (chunk, encoding, callback) => {
      const store = new oxigraph.Store([...chunk])
      const result = store.query(sparql)
      callback(null, result)
    },
  })
