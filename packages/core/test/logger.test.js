const clownface = require('clownface')
const expect = require('expect')
const rdf = require('rdf-ext')
const run = require('../lib/run')
const Logger = require('../lib/logger')
const sinon = require('sinon')
const { Writable } = require('readable-stream')

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

  test('should not push forwarded logs if has not been piped', () => {
    // given
    const masterNode = clownface(rdf.dataset(), rdf.namedNode('http://example.org/master'))
    const master = new Logger(masterNode)
    const childNode = masterNode.node(rdf.namedNode('http://example.org/child'))
    const child = new Logger(childNode, { master })
    const pushSpy = sinon.spy(master, 'push')

    // when
    child.debug('test', 'message')

    // then
    expect(pushSpy.notCalled).toBeTruthy()
  })

  test('should not push direct log if has not been piped', () => {
    // given
    const masterNode = clownface(rdf.dataset(), rdf.namedNode('http://example.org/master'))
    const master = new Logger(masterNode)
    const pushSpy = sinon.spy(master, 'push')

    // when
    master.debug('test', 'message')

    // then
    expect(pushSpy.notCalled).toBeTruthy()
  })

  test('should push forwarded logs when piped', () => {
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
    expect(pushSpy.called).toBeTruthy()
  })

  test('should push direct logs when piped', () => {
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
    expect(pushSpy.called).toBeTruthy()
  })
})
