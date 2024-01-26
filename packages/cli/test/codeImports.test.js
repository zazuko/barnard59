import { createRequire } from 'node:module'
import env from 'barnard59-env'
import formatsPretty from '@rdfjs-elements/formats-pretty'
import chai, { expect } from 'chai'
import { jestSnapshotPlugin } from 'mocha-chai-jest-snapshot'
import * as pipeline from '../lib/pipeline.js'

const require = createRequire(import.meta.url)
env.formats.import({
  serializers: formatsPretty.serializers,
})

const prefixes = [
  'sh',
  'rdf',
  ['p', 'https://pipeline.described.at/'],
  ['code', 'https://code.described.at/'],
]

describe('pipeline', () => {
  chai.use(jestSnapshotPlugin())

  context('with code:imports', () => {
    it('merges the pipelines', async () => {
      // given
      const filename = require.resolve('barnard59-test-e2e/definitions/code-imports/main.ttl')

      // when
      const { ptr } = await pipeline.parse(filename, env.namedNode('http://example.org/pipeline/'))

      // then
      const pretty = await ptr.dataset.serialize({ format: 'text/turtle', prefixes })
      expect(pretty).toMatchSnapshot()
    })
  })
})
