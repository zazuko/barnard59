import { rejects, strictEqual } from 'node:assert'
import withServer from 'express-as-promise/withServer.js'
import getStream from 'get-stream'
import { isReadableStream } from 'is-stream'
import env from 'barnard59-env'
import fetchUnbound from '../fetch.js'

const csvContent = 'id,text\n1,abc\n'
const fileMetdataUrl = 'file:./test/support/test.metadata.json'
const fileMetdataTtlUrl = 'file:./test/support/test.metadata.ttl'

describe('fetch', function () {
  [true, false].forEach((useRemoteCsvwContext) => {
    const fetch = (options) => {
      return fetchUnbound.call({ env }, {
        ...options,
        useRemoteCsvwContext,
      })
    }

    context(useRemoteCsvwContext ? 'using remote context' : 'using local context', function () {
      it('should return a readable stream', function () {
        const result = fetch({ csvw: fileMetdataUrl })

        strictEqual(isReadableStream(result), true)
      })

      it('should process file: url', async function () {
        const stream = fetch({ csvw: fileMetdataUrl })
        const content = await getStream(stream)

        strictEqual(content, csvContent)
      })

      it('should process turtle file: url', async function () {
        const stream = fetch({ csvw: fileMetdataTtlUrl })
        const content = await getStream(stream)

        strictEqual(content, csvContent)
      })

      it('should throw an error for non-existing file: metadata url', async function () {
        const stream = fetch({ csvw: 'file:./test/support/non-existing.metadata.json' })

        await rejects(getStream(stream))
      })

      it('should throw an error for non-existing file: data url', async function () {
        const stream = fetch({ csvw: 'file:./test/support/no-data.metadata.json' })

        await rejects(getStream(stream))
      })

      it('should process http: url', async function () {
        await withServer(async (server) => {
          server.app.get('/metadata', (req, res) => {
            res.set('content-type', 'application/ld+json').json({
              '@context': 'http://www.w3.org/ns/csvw',
              'url': new URL('/data', baseUrl),
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

      it('should process turtle http: url', async function () {
        await withServer(async (server) => {
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

      it('should throw an error for non-existing http: metadata url', async function () {
        await withServer(async (server) => {
          const baseUrl = await server.listen()
          const stream = fetch({ csvw: new URL('/metadata', baseUrl) })

          await rejects(getStream(stream))
        })
      })

      it('should throw an error for non-existing http: data url', async function () {
        await withServer(async (server) => {
          server.app.get('/metadata', (req, res) => {
            res.set('content-type', 'application/ld+json').json({
              '@context': 'http://www.w3.org/ns/csvw',
              'url': new URL('/data', baseUrl),
            })
          })

          const baseUrl = await server.listen()
          const stream = fetch({ csvw: new URL('/metadata', baseUrl) })

          await rejects(getStream(stream))
        })
      })

      it('should throw an error if http connection is killed', async function () {
        await withServer(async (server) => {
          server.app.get('/metadata', (req, res) => {
            res.set('content-type', 'application/ld+json').json({
              '@context': 'http://www.w3.org/ns/csvw',
              'url': new URL('/data', baseUrl),
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
  })
})
