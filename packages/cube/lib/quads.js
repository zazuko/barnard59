import { Transform } from 'node:stream'
import rdf from '@zazuko/env-node'

export const toQuad = () => new Transform({
  readableObjectMode: true,
  writableObjectMode: true,
  transform(row, _encoding, callback) {
    this.push(rdf.quad(row.s, row.p, row.o))
    callback()
  },
})
