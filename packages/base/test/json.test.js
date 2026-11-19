import { Readable } from 'node:stream'
import { pipeline } from 'node:stream/promises'
import { deepStrictEqual, rejects } from 'node:assert/strict'
import getStream from 'get-stream'
import { parseDocument } from '../json.js'

describe('json/parse/document', function () {
  it('parses one document across chunk and UTF-8 character boundaries', async function () {
    const input = Buffer.from('{"city":"Łódź"}')
    const split = input.indexOf(Buffer.from('Ł')) + 1
    const values = await pipeline(Readable.from([input.subarray(0, split), input.subarray(split)]), parseDocument(), stream => getStream.array(stream))

    deepStrictEqual(values, [{ city: 'Łódź' }])
  })

  it('rejects a truncated document', async function () {
    await rejects(pipeline(Readable.from(['{"city":']), parseDocument(), stream => getStream.array(stream)), SyntaxError)
  })

  it('treats a top-level null as no output, like the chunk parser', async function () {
    const values = await pipeline(Readable.from(['null']), parseDocument(), stream => getStream.array(stream))

    deepStrictEqual(values, [])
  })
})
