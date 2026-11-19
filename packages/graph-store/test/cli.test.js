import { deepStrictEqual, ok, strictEqual } from 'node:assert'
import { execFile, spawnSync } from 'node:child_process'
import { once } from 'node:events'
import { mkdtempSync, rmdirSync, unlinkSync, writeFileSync } from 'node:fs'
import { createServer } from 'node:http'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { promisify } from 'node:util'
import { fileURLToPath } from 'node:url'

const cwd = fileURLToPath(new URL('..', import.meta.url))
const entrypoint = fileURLToPath(new URL('../../cli/bin/barnard59.js', import.meta.url))

describe('graph-store put command', function () {
  this.timeout(20000)

  it('fails on an empty RDF file by default and skips the upload with --allow-empty', function () {
    const directory = mkdtempSync(join(tmpdir(), 'barnard59-'))
    const source = join(directory, 'empty.ttl')
    writeFileSync(source, '')
    try {
      const args = [
        '--import', 'tsx', entrypoint, 'graph-store', 'put',
        '--source', source, '--graph', 'https://example.org/graph', '--endpoint', 'http://127.0.0.1:1',
      ]

      const rejected = spawnSync(process.execPath, args, { cwd, encoding: 'utf8' })
      strictEqual(rejected.status, 1, rejected.stderr)
      ok(rejected.stderr.includes('No RDF quads found'), rejected.stderr)

      const skipped = spawnSync(process.execPath, [...args, '--allow-empty'], { cwd, encoding: 'utf8' })
      strictEqual(skipped.status, 0, skipped.stderr)
      ok(skipped.stderr.includes('No request was made'), skipped.stderr)
    }
    finally {
      unlinkSync(source)
      rmdirSync(directory)
    }
  })

  it('sends an empty PUT with --allow-clear, including when both flags are set', async function () {
    const directory = mkdtempSync(join(tmpdir(), 'barnard59-'))
    const source = join(directory, 'empty.ttl')
    const requests = []
    const server = createServer(async (req, res) => {
      let body = ''
      for await (const chunk of req.setEncoding('utf8')) {
        body += chunk
      }
      requests.push({ method: req.method, url: req.url, body })
      res.writeHead(204).end()
    })

    writeFileSync(source, '')
    try {
      server.listen(0, '127.0.0.1')
      await once(server, 'listening')

      const graph = 'https://example.org/graph'
      const endpoint = `http://127.0.0.1:${server.address().port}`
      const args = ['--import', 'tsx', entrypoint, 'graph-store', 'put', '--graph', graph, '--endpoint', endpoint, '--allow-clear']

      await promisify(execFile)(process.execPath, [...args, '--source', source], { cwd })
      await promisify(execFile)(process.execPath, [...args, '--source', join(directory, 'missing-*.ttl'), '--allow-empty'], { cwd })

      const expected = { method: 'PUT', url: `/?graph=${encodeURIComponent(graph)}`, body: '' }
      deepStrictEqual(requests, [expected, expected])
    }
    finally {
      server.close()
      unlinkSync(source)
      rmdirSync(directory)
    }
  })
})
