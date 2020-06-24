const { describe, it } = require('mocha')
const { strictEqual } = require('assert')
const getStream = require('get-stream')
const intoStream = require('into-stream')
const map = require('../lib/map')

describe('map', () => {
  it('accepts a function as parameter', async () => {
    // given
    const transform = letter => letter.toUpperCase()
    const input = intoStream.object(['a', 'b', 'c'])

    // when
    const result = await getStream(input.pipe(map(transform)))

    // then
    strictEqual(result, 'ABC')
  })

  it('binds pipeline context to transform function', async () => {
    // const
    function transform (letter) {
      return letter + this.suffix
    }
    const input = intoStream.object(['A', 'B', 'C'])

    // when
    const boundMap = map.bind({ suffix: 'x' })
    const result = await getStream(input.pipe(boundMap(transform)))

    // then
    strictEqual(result, 'AxBxCx')
  })

  it('accepts an option to not retain order', async () => {
    // given
    const transform = async letter => {
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
      concurrency: 3
    })))

    // then
    strictEqual(result, 'BCA')
  })

  it('retains input order by default', async () => {
    // given
    const transform = async letter => {
      if (letter === 'a') {
        await new Promise(resolve => setTimeout(resolve, 10))
      }

      return letter.toUpperCase()
    }
    const input = intoStream.object(['a', 'b', 'c'])

    // when
    const result = await getStream(input.pipe(map({
      map: transform,
      concurrency: 3
    })))

    // then
    strictEqual(result, 'ABC')
  })
})
