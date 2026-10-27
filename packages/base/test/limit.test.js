import { Readable, Duplex } from 'node:stream'
import { expect } from 'chai'
import getStream from 'get-stream'
import limit from '../limit.js'

describe('limit', function () {
  it('should return generator', function () {
    const step = limit(1)

    expect(step).to.be.instanceOf(Function)
  })

  it('stop processing chunks when limit is reached', async function () {
    // given
    const step = limit(1)

    // when
    const stream = Readable.from([0, 1, 2, 3, 4]).pipe(Duplex.from(step))
    const limited = await getStream.array(stream)

    expect(limited).to.deep.equal([0])
  })
})
