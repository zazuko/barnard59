import { describe, it } from 'mocha'
import fs from 'fs'
import { resolve, dirname } from 'path'
import { parse as createParser } from '../rdf-xml.js'
import { readDataset } from './helpers.js'
import { ok } from 'assert'

const __dirname = dirname(new URL(import.meta.url).pathname)

describe('rdf/xml', () => {
  describe('parse', () => {
    it('successfully loads the input file', async () => {
      // given
      const input = fs.createReadStream(resolve(__dirname, './datasets/bioinformatics.rdf'))

      // when
      const parse = createParser()
      const dataset = await readDataset(input.pipe(parse))

      // then
      ok(dataset.length > 0)
    })
  })
})
