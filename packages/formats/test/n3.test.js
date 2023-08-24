import fs from 'fs'
import rdf from '@zazuko/env'
import fromStream from 'rdf-dataset-ext/fromStream.js'
import { expect } from 'chai'
import { parse } from '../n3.js'

describe('n3', () => {
  describe('parse', () => {
    it('successfully loads the input file', async () => {
      const input = fs.createReadStream(new URL('./datasets/ontologist.n3', import.meta.url))

      const parser = parse()
      const dataset = await fromStream(rdf.dataset(), input.pipe(parser))

      expect(dataset).to.have.property('size').gt(0)
    })

    it('forwards argument to parser options', async () => {
      const input = fs.createReadStream(new URL('./rules/weather.n3', import.meta.url))

      const parser = parse({
        format: 'text/n3',
      })
      const dataset = await fromStream(rdf.dataset(), input.pipe(parser))

      expect(dataset).to.have.property('size').gt(0)
    })
  })
})
