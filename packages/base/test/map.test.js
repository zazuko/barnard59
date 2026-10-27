/* eslint-disable mocha/no-nested-tests */
import { deepStrictEqual } from 'node:assert'
import { Readable } from 'node:stream'
import getStream, { array } from 'get-stream'
import intoStream from 'into-stream'
import map from '../map.js'

describe('map', function () {
  it('should pass pipeline context to mapper function', async function () {
    const input = new Readable({
      read: () => {
        input.push('a')
        input.push('b')
        input.push(null)
      },
    })
    const context = {
      variable: new Map().set('prefix', 'foo_'),
    }

    const outStream = input.pipe(map.call(context, function (chunk) {
      return this.variable.get('prefix') + chunk
    }))
    const output = await array(outStream)

    deepStrictEqual(output, ['foo_a', 'foo_b'])
  })

  it('should pass optional arguments to mapper function', async function () {
    const input = new Readable({
      read: () => {
        input.push('a')
        input.push('b')
        input.push(null)
      },
    })

    const prependPrefix = (chunk, prefix) => prefix + chunk
    const outStream = input.pipe(map.call(context, prependPrefix, 'foo_'))
    const output = await array(outStream)

    deepStrictEqual(output, ['foo_a', 'foo_b'])
  })

  it('should pass optional arguments to mapper function when used with options object', async function () {
    const input = new Readable({
      read: () => {
        input.push('a')
        input.push('b')
        input.push(null)
      },
    })

    const prependPrefix = (chunk, prefix) => prefix + chunk
    const outStream = input.pipe(map.call(context, {
      map: prependPrefix,
    }, 'foo_'))
    const output = await array(outStream)

    deepStrictEqual(output, ['foo_a', 'foo_b'])
  })

  it('accepts a function as parameter', async function () {
    // given
    const transform = letter => letter.toUpperCase()
    const input = intoStream.object(['a', 'b', 'c'])

    // when
    const result = await getStream(input.pipe(map(transform)))

    // then
    deepStrictEqual(result, 'ABC')
  })

  it('binds pipeline context to transform function', async function () {
    // const
    function transform(letter) {
      return letter + this.suffix
    }
    const input = intoStream.object(['A', 'B', 'C'])

    // when
    const boundMap = map.bind({ suffix: 'x' })
    const result = await getStream(input.pipe(boundMap(transform)))

    // then
    deepStrictEqual(result, 'AxBxCx')
  })

  it('accepts an option to not retain order', async function () {
    // given
    const transform = async (letter) => {
      if (letter === 'a') {
        await new Promise(resolve => setTimeout(resolve, 10))
      }

      return letter.toUpperCase()
    }
    const input = intoStream.object(['a', 'b', 'c'])

    // when
    const result = await getStream(input.pipe(map({
      map: transform,
      ordered: false,
      concurrency: 3,
    })))

    // then
    deepStrictEqual(result, 'BCA')
  })

  it('retains input order by default', async function () {
    // given
    const transform = async (letter) => {
      if (letter === 'a') {
        await new Promise(resolve => setTimeout(resolve, 10))
      }

      return letter.toUpperCase()
    }
    const input = intoStream.object(['a', 'b', 'c'])

    // when
    const result = await getStream(input.pipe(map({
      map: transform,
      concurrency: 3,
    })))

    // then
    deepStrictEqual(result, 'ABC')
  })
})
