import assert from 'node:assert'
import { isReadableStream } from 'is-stream'
import * as Readable from '../Readable.js'

describe('Readable', () => {
  it('should return a readable stream', () => {
    // given
    const stream = Readable.from([0, 1, 2, 3, 4])

    // then
    assert(isReadableStream(stream))
  })
})
