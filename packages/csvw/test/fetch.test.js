const { describe, it, beforeEach, before, after } = require('mocha')
const { expect } = require('chai')
const Runner = require('barnard59/lib/runner')
const path = require('path')
const clownface = require('clownface-io')
const { namedNode } = require('@rdfjs/data-model')
const toString = require('stream-to-string')
const toStream = require('string-to-stream')
const sinon = require('sinon')
const proto = require('../lib/protoFetch')

describe('fetch', function () {
  const pipelinesPath = 'file:' + path.resolve(__dirname, 'pipelines/fetch.ttl')
  const basePath = path.resolve(__dirname, '..')

  let variable
  const outputStream = process.stdout

  before(() => {
    sinon.restore()
    sinon.stub(proto, 'fetch')
  })

  beforeEach(() => {
    variable = new Map()
    variable.set('basePath', path.resolve(__dirname, '..'))
  })

  after(() => {
    sinon.restore()
  })

  it('parses local JSON-LD mappings and fetches remote CSV', async () => {
    // given
    const pipeline = await clownface().namedNode(pipelinesPath).fetch()
    const run = Runner.create({
      outputStream,
      variable,
      basePath,
      dataset: pipeline.dataset,
      term: namedNode('urn:barnard59-csvw:test#LocalCsvw-HttpCsv')
    })
    proto.fetch.resolves({
      body: toStream('foo,bar,baz\n10,20,30')
    })

    // when
    const result = await toString(run.pipeline)

    // then
    expect(result).to.eq('foo,bar,baz\n10,20,30')
    expect(proto.fetch).to.have.been.calledWith('http://example.com/test.csv')
  })
})
