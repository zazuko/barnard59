import { deepStrictEqual } from 'assert'
import { array } from 'get-stream'
import { Readable } from 'readable-stream'
import filter from '../filter.js'

describe('filter', () => {
  it('should pass pipeline context to callback function', async () => {
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

    const outStream = input.pipe(filter.call(context, function (chunk) {
      return this.variable.get('condition') === chunk
    }))
    const output = await array(outStream)

    deepStrictEqual(output, ['a'])
  })
})
