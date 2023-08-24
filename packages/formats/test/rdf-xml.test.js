import fs from 'fs'
import rdf from '@zazuko/env'
import fromStream from 'rdf-dataset-ext/fromStream.js'
import { expect } from 'chai'
import { parse } from '../rdf-xml.js'

describe('rdf/xml', () => {
  describe('parse', () => {
    it('successfully loads the input file', async () => {
      const input = fs.createReadStream(new URL('./datasets/bioinformatics.rdf', import.meta.url))

      const parser = parse()
      const dataset = await fromStream(rdf.dataset(), input.pipe(parser))

      expect(dataset).to.have.property('size').gt(0)
    })
  })
})
