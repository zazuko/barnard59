import { deepStrictEqual } from 'assert'
import { array } from 'get-stream'
import { Readable } from 'readable-stream'
import filter from '../filter.js'

describe('filter', () => {
  it('should pass pipeline context to callback function', async () => {
    // given
    const input = new Readable({
      objectMode: true,
      read: () => {
        input.push('a')
        input.push('b')
        input.push(null)
      },
    })
    const context = {
      variable: new Map().set('condition', 'a'),
    }

    // when
    const outStream = input.pipe(filter.call(context, function (chunk) {
      return this.variable.get('condition') === chunk
    }))
    const output = await array(outStream)

    // then
    deepStrictEqual(output, ['a'])
  })

  it('should pass additional arguments to callback function', async () => {
    // given
    const input = new Readable({
      objectMode: true,
      read: () => {
        input.push(1)
        input.push(2)
        input.push(3)
        input.push(null)
      },
    })

    // when
    const greaterThan = (chunk, _, minValue) => chunk > minValue
    const outStream = input.pipe(filter.call(context, greaterThan, 2))
    const output = await array(outStream)

    // then
    deepStrictEqual(output, [3])
  })
})
