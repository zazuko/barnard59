const expect = require('expect')
const fs = require('fs')
const path = require('path')
const createParser = require('../lib/n3').parse
const { readDataset } = require('./helpers')

describe('n3', () => {
  describe('parse', () => {
    it('successfully loads the input file', async () => {
      // given
      const input = fs.createReadStream(path.resolve(__dirname, './datasets/ontologist.n3'))

      // when
      const parse = createParser()
      const dataset = await readDataset(input.pipe(parse))

      // then
      expect(dataset.length).toBeGreaterThan(0)
    })
  })
})
