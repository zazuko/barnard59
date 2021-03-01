import { describe, it } from 'mocha'
import fs from 'fs'
import { resolve, dirname } from 'path'
import { parse as createParser } from '../n3.js'
import { readDataset } from './helpers.js'
import { ok } from 'assert'

const __dirname = dirname(new URL(import.meta.url).pathname)

describe('n3', () => {
  describe('parse', () => {
    it('successfully loads the input file', async () => {
      // given
      const input = fs.createReadStream(resolve(__dirname, './datasets/ontologist.n3'))

      // when
      const parse = createParser()
      const dataset = await readDataset(input.pipe(parse))

      // then
      ok(dataset.length > 0)
    })
  })
})
