const { deepStrictEqual } = require('assert')
const getStream = require('get-stream')
const { describe, it } = require('mocha')
const { Readable } = require('readable-stream')
const map = require('../lib/map')

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
    const output = await getStream.array(outStream)

    deepStrictEqual(output, ['foo_a', 'foo_b'])
  })
})
