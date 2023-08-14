import { rejects, strictEqual } from 'assert'
import withServer from 'express-as-promise/withServer.js'
import getStream from 'get-stream'
import { isReadable } from 'isstream'
import { describe, it } from 'mocha'
import fetch from '../fetch.js'

const csvContent = 'id,text\n1,abc\n'
const fileMetdataUrl = 'file:./test/support/test.metadata.json'
const fileMetdataTtlUrl = 'file:./test/support/test.metadata.ttl'

describe('fetch', () => {
  it('should be a function', () => {
    strictEqual(typeof fetch, 'function')
  })

  it('should return a readable stream', () => {
    const result = fetch({ csvw: fileMetdataUrl })

    strictEqual(isReadable(result), true)
  })

  it('should process file: url', async () => {
    const stream = fetch({ csvw: fileMetdataUrl })
    const content = await getStream(stream)

    strictEqual(content, csvContent)
  })

  it('should process turtle file: url', async () => {
    const stream = fetch({ csvw: fileMetdataTtlUrl })
    const content = await getStream(stream)

    strictEqual(content, csvContent)
  })

  it('should throw an error for non-existing file: metadata url', async () => {
    const stream = fetch({ csvw: 'file:./test/support/non-existing.metadata.json' })

    await rejects(getStream(stream))
  })

  it('should throw an error for non-existing file: data url', async () => {
    const stream = fetch({ csvw: 'file:./test/support/no-data.metadata.json' })

    await rejects(getStream(stream))
  })

  it('should process http: url', async () => {
    await withServer(async server => {
      server.app.get('/metadata', (req, res) => {
        res.set('content-type', 'application/ld+json').json({
          '@context': 'http://www.w3.org/ns/csvw',
          url: new URL('/data', baseUrl)
        })
      })

      server.app.get('/data', (req, res) => {
        res.set('content-type', 'text/csv').end(csvContent)
      })

      const baseUrl = await server.listen()
      const stream = fetch({ csvw: new URL('/metadata', baseUrl) })
      const content = await getStream(stream)

      strictEqual(content, csvContent)
    })
  })

  it('should process turtle http: url', async () => {
    await withServer(async server => {
      server.app.get('/metadata', (req, res) => {
        res.set('content-type', 'text/turtle').end(`[
          <http://www.w3.org/ns/csvw#url> <${new URL('data', baseUrl)}>
        ].`)
      })

      server.app.get('/data', (req, res) => {
        res.set('content-type', 'text/csv').end(csvContent)
      })

      const baseUrl = await server.listen()
      const stream = fetch({ csvw: new URL('/metadata', baseUrl) })
      const content = await getStream(stream)

      strictEqual(content, csvContent)
    })
  })

  it('should throw an error for non-existing http: metadata url', async () => {
    await withServer(async server => {
      const baseUrl = await server.listen()
      const stream = fetch({ csvw: new URL('/metadata', baseUrl) })

      await rejects(getStream(stream))
    })
  })

  it('should throw an error for non-existing http: data url', async () => {
    await withServer(async server => {
      server.app.get('/metadata', (req, res) => {
        res.set('content-type', 'application/ld+json').json({
          '@context': 'http://www.w3.org/ns/csvw',
          url: new URL('/data', baseUrl)
        })
      })

      const baseUrl = await server.listen()
      const stream = fetch({ csvw: new URL('/metadata', baseUrl) })

      await rejects(getStream(stream))
    })
  })

  it('should throw an error if http connection is killed', async () => {
    await withServer(async server => {
      server.app.get('/metadata', (req, res) => {
        res.set('content-type', 'application/ld+json').json({
          '@context': 'http://www.w3.org/ns/csvw',
          url: new URL('/data', baseUrl)
        })
      })

      server.app.get('/data', async (req, res) => {
        res.set('content-type', 'text/csv')
        res.write('abc')
        res.socket.destroy()
      })

      const baseUrl = await server.listen()
      const stream = fetch({ csvw: new URL('/metadata', baseUrl) })

      await rejects(getStream(stream))
    })
  })
})
