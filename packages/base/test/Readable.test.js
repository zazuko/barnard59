import assert from 'node:assert'
import { isReadableStream } from 'is-stream'
import getStream from 'get-stream'
import { expect } from 'chai'
import * as Readable from '../Readable.js'

describe('Readable', () => {
  it('should return a readable stream', async () => {
    // given
    const stream = Readable.from(0, 1, 2, 3, 4)

    // then
    assert(isReadableStream(stream))
    const array = await getStream.array(stream)
    expect(array).to.deep.equal([0, 1, 2, 3, 4])
  })
})
