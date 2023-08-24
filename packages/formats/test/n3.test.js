import { strictEqual } from 'assert'
import fs from 'fs'
import { describe, it } from 'mocha'
import rdf from 'rdf-ext'
import { parse } from '../n3.js'

describe('n3', () => {
  describe('parse', () => {
    it('successfully loads the input file', async () => {
      const input = fs.createReadStream(new URL('./datasets/ontologist.n3', import.meta.url))

      const parser = parse()
      const dataset = await rdf.dataset().import(input.pipe(parser))

      strictEqual(dataset.length > 0, true)
    })

    it('forwards argument to parser options', async () => {
      const input = fs.createReadStream(new URL('./rules/weather.n3', import.meta.url))

      const parser = parse({
        format: 'text/n3'
      })
      const dataset = await rdf.dataset().import(input.pipe(parser))

      strictEqual(dataset.length > 0, true)
    })
  })
})
