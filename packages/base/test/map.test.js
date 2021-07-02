import { deepStrictEqual } from 'assert'
import { array } from 'get-stream'
import { describe, it } from 'mocha'
import { Readable } from 'readable-stream'
import map from '../map.js'

describe('map', () => {
  it('should pass pipeline context to mapper function', async () => {
    const input = new Readable({
      read: () => {
        input.push('a')
        input.push('b')
        input.push(null)
      }
    })
    const context = {
      variable: new Map().set('prefix', 'foo_')
    }

    const outStream = input.pipe(map.call(context, function (chunk) {
      return this.variable.get('prefix') + chunk
    }))
    const output = await array(outStream)

    deepStrictEqual(output, ['foo_a', 'foo_b'])
  })
})
