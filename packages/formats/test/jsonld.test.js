import fs from 'node:fs'
import { expect } from 'chai'
import { parse as unbound } from '../jsonld.js'
import rdf from './support/env.js'

const parse = unbound.bind({ env: rdf })

describe('jsonld', () => {
  describe('parse', () => {
    it('should load a file with a remote context', async () => {
      const input = fs.createReadStream(new URL('./assets/remote.json', import.meta.url))

      const parser = parse()
      const dataset = await rdf.dataset().import(input.pipe(parser))

      expect(dataset).to.have.property('size').gt(0)
    })

    it('should load a file with a local context', async () => {
      const input = fs.createReadStream(new URL('./assets/local.json', import.meta.url))

      const parser = parse({
        localContext: {
          'http://example.org/ns/csvw': './test/assets/csvw.context.json',
        },
      })
      const dataset = await rdf.dataset().import(input.pipe(parser))

      expect(dataset).to.have.property('size').gt(0)
    })

    it('should load a file with a local context given as string', async () => {
      const input = fs.createReadStream(new URL('./assets/local.json', import.meta.url))

      const parser = parse({
        localContext: JSON.stringify({
          'http://example.org/ns/csvw': './test/assets/csvw.context.json',
        }),
      })
      const dataset = await rdf.dataset().import(input.pipe(parser))

      expect(dataset).to.have.property('size').gt(0)
    })

    it('should use factory from context', async () => {
      const input = fs.createReadStream(new URL('./assets/test.json', import.meta.url))

      const parser = parse()
      const [quad] = await rdf.dataset().import(input.pipe(parser))

      expect(quad.extended).to.be.true
    })
  })
})
