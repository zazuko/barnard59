import { Readable } from 'stream'
import { expect } from 'chai'
import getStream from 'get-stream'
import withServer from 'express-as-promise/withServer.js'
import sinon from 'sinon'
import open from '../open.js'

describe('open', function () {
  it('should open from local path', async () => {
    // given
    const env = {
      fromFile: sinon.stub().returns(Readable.from('foo')),
    }
    const stream = await open.call({ env }, 'test/support/dataset.ttl')

    // when
    const loaded = await getStream(stream)

    // then
    expect(loaded).to.eq('foo')
    expect(env.fromFile).to.have.been.calledWith('test/support/dataset.ttl')
  })

  it('should load from remote URL', async () => {
    // given
    const env = {
      formats: {
        parsers: {
          import: sinon.stub().returns('foo'),
        },
      },
      fetch: async () => new Response('', {
        headers: {
          'Content-Type': 'text/turtle',
        },
      }),
    }

    return withServer(async (server) => {
      server.app.get('/dataset.ttl', (req, res) => {
        res.send('foo')
      })

      const base = await server.listen()
      const stream = open.call({ env }, new URL('dataset.ttl', base))

      // when
      const [quad] = await getStream.array(stream)

      // then
      expect(quad).to.eq('foo')
      expect(env.formats.parsers.import).to.have.been.calledWith('text/turtle', sinon.match.any)
    })
  })

  it('should load from remote URL with overridden media type', async () => {
    // given
    const env = {
      formats: {
        parsers: {
          import: sinon.stub().returns('foo'),
        },
      },
      fetch: async () => new Response('', {
        headers: {
          'Content-Type': 'text/plain',
        },
      }),
    }

    return withServer(async (server) => {
      server.app.get('/dataset.ttl', (req, res) => {
        res.send('foo')
      })

      const base = await server.listen()
      const stream = open.call({ env }, new URL('dataset.ttl', base), 'text/turtle')

      // when
      const [quad] = await getStream.array(stream)

      // then
      expect(quad).to.eq('foo')
      expect(env.formats.parsers.import).to.have.been.calledWith('text/turtle', sinon.match.any)
    })
  })
})
