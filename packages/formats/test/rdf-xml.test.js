const expect = require('expect')
const fs = require('fs')
const path = require('path')
const createParser = require('../lib/rdf-xml').parse
const { readDataset } = require('./helpers')

describe('rdf/xml', () => {
  describe('parse', () => {
    it('successfully loads the input file', async () => {
      // given
      const input = fs.createReadStream(path.resolve(__dirname, './datasets/bioinformatics.rdf'))

      // when
      const parse = createParser()
      const dataset = await readDataset(input.pipe(parse))

      // then
      expect(dataset.length).toBeGreaterThan(0)
    })
  })
})
