import { strictEqual } from 'assert'
import fs from 'fs'
import { describe, it } from 'mocha'
import rdf from 'rdf-ext'
import { parse } from '../jsonld.js'

describe('jsonld', () => {
  describe('parse', () => {
    it('should load a file with a remote context', async () => {
      const input = fs.createReadStream(new URL('./assets/remote.json', import.meta.url))

      const parser = parse()
      const dataset = await rdf.dataset().import(input.pipe(parser))

      strictEqual(dataset.length > 0, true)
    })

    it('should load a file with a local context', async () => {
      const input = fs.createReadStream(new URL('./assets/local.json', import.meta.url))

      const parser = parse({
        localContext: {
          'http://example.org/ns/csvw': './test/assets/csvw.context.json'
        }
      })
      const dataset = await rdf.dataset().import(input.pipe(parser))

      strictEqual(dataset.length > 0, true)
    })

    it('should load a file with a local context given as string', async () => {
      const input = fs.createReadStream(new URL('./assets/local.json', import.meta.url))

      const parser = parse({
        localContext: JSON.stringify({
          'http://example.org/ns/csvw': './test/assets/csvw.context.json'
        })
      })
      const dataset = await rdf.dataset().import(input.pipe(parser))

      strictEqual(dataset.length > 0, true)
    })
  })
})
