import fs from 'node:fs'
import { expect } from 'chai'
import { parse } from '../rdf-xml.js'
import env from './support/env.js'

describe('rdf/xml', () => {
  describe('parse', () => {
    it('successfully loads the input file', async () => {
      const input = fs.createReadStream(new URL('./datasets/bioinformatics.rdf', import.meta.url))

      const parser = parse.call({ env })
      const dataset = await env.dataset().import(input.pipe(parser))

      expect(dataset).to.have.property('size').gt(0)
    })

    it('forwards argument to parser options', async () => {
      const input = fs.createReadStream(new URL('./datasets/bioinformatics.rdf', import.meta.url))

      const parser = parse.call({ env })
      const [quad] = await env.dataset().import(input.pipe(parser))

      expect(quad.extended).to.be.true
    })
  })
})
