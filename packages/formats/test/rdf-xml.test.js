import { strictEqual } from 'assert'
import fs from 'fs'
import { describe, it } from 'mocha'
import rdf from 'rdf-ext'
import { parse } from '../rdf-xml.js'

describe('rdf/xml', () => {
  describe('parse', () => {
    it('successfully loads the input file', async () => {
      const input = fs.createReadStream(new URL('./datasets/bioinformatics.rdf', import.meta.url))

      const parser = parse()
      const dataset = await rdf.dataset().import(input.pipe(parser))

      strictEqual(dataset.length > 0, true)
    })
  })
})
