import { Readable } from 'node:stream'
import { resolve } from 'node:path'
import * as url from 'node:url'
import $rdf from 'barnard59-env'
import { use, expect } from 'chai'
import { jestSnapshotPlugin } from 'mocha-chai-jest-snapshot'
import { parse as unbound } from '../fs.js'

const __dirname = url.fileURLToPath(new URL('.', import.meta.url))

const parse = unbound.bind({ env: $rdf })

describe('fs', function () {
  use(jestSnapshotPlugin())

  describe('parse', function () {
    it('parses files from input chunks paths', async function () {
      // given
      const files = Readable.from([
        resolve(__dirname, 'support/fs-samples/A.ttl'),
        resolve(__dirname, 'support/fs-samples/B.jsonld'),
        resolve(__dirname, 'support/fs-samples/C.nq'),
      ])

      // when
      const dataset = await $rdf.dataset().import(files.pipe(parse()))

      // then
      expect(dataset.toCanonical()).toMatchSnapshot()
    })

    it('fails when file does not exist', function (done) {
      // given
      const files = Readable.from([
        resolve('no-such-file.ttl'),
      ])

      // when
      const stream = files.pipe(parse())

      // then
      stream.on('error', (err) => {
        expect(err.message).to.match(/no such file or directory/)
        done()
      })
    })

    it('fails when file fails to parse', function (done) {
      // given
      const files = Readable.from([
        resolve(__dirname, 'support/fs-samples/bad.ttl'),
      ])

      // when
      const stream = files.pipe(parse())

      // then
      stream.on('error', (err) => {
        expect(err.message).to.match(/Expected entity/)
        done()
      })
    })

    it('fails when extensions is unrecognised', function (done) {
      // given
      const files = Readable.from([
        resolve(__dirname, 'support/file.unknown.extension'),
      ])

      // when
      const stream = files.pipe(parse())

      // then
      stream.on('error', (err) => {
        expect(err.message).to.match(/Unknown file extension/)
        done()
      })
    })
  })
})
