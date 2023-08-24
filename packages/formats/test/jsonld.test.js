import fs from 'fs'
import rdf from '@zazuko/env'
import fromStream from 'rdf-dataset-ext/fromStream.js'
import { expect } from 'chai'
import { parse } from '../jsonld.js'

describe('jsonld', () => {
  describe('parse', () => {
    it('should load a file with a remote context', async () => {
      const input = fs.createReadStream(new URL('./assets/remote.json', import.meta.url))

      const parser = parse()
      const dataset = await fromStream(rdf.dataset(), input.pipe(parser))

      expect(dataset).to.have.property('size').gt(0)
    })

    it('should load a file with a local context', async () => {
      const input = fs.createReadStream(new URL('./assets/local.json', import.meta.url))

      const parser = parse({
        localContext: {
          'http://example.org/ns/csvw': './test/assets/csvw.context.json',
        },
      })
      const dataset = await fromStream(rdf.dataset(), input.pipe(parser))

      expect(dataset).to.have.property('size').gt(0)
    })

    it('should load a file with a local context given as string', async () => {
      const input = fs.createReadStream(new URL('./assets/local.json', import.meta.url))

      const parser = parse({
        localContext: JSON.stringify({
          'http://example.org/ns/csvw': './test/assets/csvw.context.json',
        }),
      })
      const dataset = await fromStream(rdf.dataset(), input.pipe(parser))

      expect(dataset).to.have.property('size').gt(0)
    })
  })
})
