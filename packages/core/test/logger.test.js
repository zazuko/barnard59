const { strictEqual } = require('assert')
const clownface = require('clownface')
const { describe, it } = require('mocha')
const rdf = require('rdf-ext')
const { Writable } = require('readable-stream')
const sinon = require('sinon')
const run = require('../lib/run')
const Logger = require('../lib/logger')

describe('Logger', () => {
  it('should unpipe itself from master at end', async () => {
    // given
    const masterNode = clownface(rdf.dataset(), rdf.namedNode('http://example.org/master'))
    const master = new Logger(masterNode)
    const childNode = masterNode.node(rdf.namedNode('http://example.org/child'))
    const child = new Logger(childNode, { master })

    // when
    child.end()
    await run(child)

    // then
    strictEqual(child._readableState.pipesCount, 0)
  })

  it('should not push forwarded logs if has not been piped', () => {
    // given
    const masterNode = clownface(rdf.dataset(), rdf.namedNode('http://example.org/master'))
    const master = new Logger(masterNode)
    const childNode = masterNode.node(rdf.namedNode('http://example.org/child'))
    const child = new Logger(childNode, { master })
    const pushSpy = sinon.spy(master, 'push')

    // when
    child.debug('test', 'message')

    // then
    strictEqual(pushSpy.notCalled, true)
  })

  it('should not push direct log if has not been piped', () => {
    // given
    const masterNode = clownface(rdf.dataset(), rdf.namedNode('http://example.org/master'))
    const master = new Logger(masterNode)
    const pushSpy = sinon.spy(master, 'push')

    // when
    master.debug('test', 'message')

    // then
    strictEqual(pushSpy.notCalled, true)
  })

  it('should push forwarded logs when piped', () => {
    // given
    const masterNode = clownface(rdf.dataset(), rdf.namedNode('http://example.org/master'))
    const master = new Logger(masterNode)
    const pushSpy = sinon.spy(master, 'push')
    const downstream = new Writable({ objectMode: true })
    downstream._write = (c, e, done) => done()
    master.pipe(downstream)

    // when
    master.debug('test', 'message')

    // then
    strictEqual(pushSpy.called, true)
  })

  it('should push direct logs when piped', () => {
    // given
    const masterNode = clownface(rdf.dataset(), rdf.namedNode('http://example.org/master'))
    const master = new Logger(masterNode)
    const childNode = masterNode.node(rdf.namedNode('http://example.org/child'))
    const child = new Logger(childNode, { master })
    const pushSpy = sinon.spy(master, 'push')
    const downstream = new Writable({ objectMode: true })
    downstream._write = (c, e, done) => done()
    master.pipe(downstream)

    // when
    child.debug('test', 'message')

    // then
    strictEqual(pushSpy.called, true)
  })
})
