import fs from 'fs'
import env from '@zazuko/env-node'
import { expect } from 'chai'
import { parse } from '../rdf-xml.js'

describe('rdf/xml', () => {
  describe('parse', () => {
    it('successfully loads the input file', async () => {
      const input = fs.createReadStream(new URL('./datasets/bioinformatics.rdf', import.meta.url))

      const parser = parse.call({ env })
      const dataset = await env.dataset().import(input.pipe(parser))

      expect(dataset).to.have.property('size').gt(0)
    })
  })
})
