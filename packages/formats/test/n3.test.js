import fs from 'fs'
import env from 'barnard59-env'
import { expect } from 'chai'
import { parse } from '../n3.js'

describe('n3', () => {
  describe('parse', () => {
    it('successfully loads the input file', async () => {
      const input = fs.createReadStream(new URL('./datasets/ontologist.n3', import.meta.url))

      const parser = parse.call({ env })
      const dataset = await env.dataset().import(input.pipe(parser))

      expect(dataset).to.have.property('size').gt(0)
    })

    it('forwards argument to parser options', async () => {
      const input = fs.createReadStream(new URL('./rules/weather.n3', import.meta.url))

      const parser = parse.call({ env }, {
        format: 'text/n3',
      })
      const dataset = await env.dataset().import(input.pipe(parser))

      expect(dataset).to.have.property('size').gt(0)
    })
  })
})
