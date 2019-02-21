/* global describe, test */
const clownface = require('clownface')
const expect = require('expect')
const rdf = require('rdf-ext')
const run = require('../lib/run')
const Logger = require('../lib/logger')

describe('Logger', () => {
  test('should unpipe itself from master at end', async () => {
    // given
    const masterNode = clownface(rdf.dataset(), rdf.namedNode('http://example.org/master'))
    const master = new Logger(masterNode)
    const childNode = masterNode.node(rdf.namedNode('http://example.org/child'))
    const child = new Logger(childNode, { master })

    // when
    child.end()
    await run(child)

    // then
    expect(child._readableState.pipesCount).toBe(0)
  })
})
