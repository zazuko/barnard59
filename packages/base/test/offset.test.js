import { Readable, Duplex } from 'node:stream'
import { expect } from 'chai'
import getStream from 'get-stream'
import offset from '../offset.js'

describe('offset', () => {
  it('should return generator', () => {
    const step = offset(1)

    expect(step).to.be.instanceOf(Function)
  })

  it('stop processing chunks when limit is reached', async () => {
    // given
    const step = offset(2)

    // when
    const stream = Readable.from([0, 1, 2, 3, 4]).pipe(Duplex.from(step))
    const skipped = await getStream.array(stream)

    expect(skipped).to.deep.equal([2, 3, 4])
  })
})
