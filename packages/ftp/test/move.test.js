import { strictEqual } from 'assert'
import { resolve } from 'path'
import getStream from 'get-stream'
import { Readable } from 'readable-stream'
import move from '../move.js'
import fs from './support/fs.js'
import { withServer } from './support/server.js'
import serverConfigurations, { base } from './support/serverConfigurations.js'

describe('move', () => {
  it('is a function', () => {
    strictEqual(typeof move, 'function')
  })

  serverConfigurations.forEach(([label, serverFactory, additionalOptions]) => {
    it(`moves a file from the given place to another place ${label}`, async () => {
      await withServer(serverFactory, async server => {
        const options = { ...server.options, ...additionalOptions }

        const root = resolve(base, 'tmp/move')
        const original = resolve(base, 'data/xyz.txt')
        const source = resolve(root, 'xyz.txt')
        const target = resolve(root, 'xyz.moved')
        await fs.rmdir(root)
        await fs.mkdir(root, { recursive: true })
        await fs.copyFile(original, source)

        const input = new Readable({ read: () => input.push(null) })

        const stream = await move({ source: 'tmp/move/xyz.txt', target: 'tmp/move/xyz.moved', ...options })
        input.pipe(stream)
        await getStream(stream)
        const content = await fs.readFile(target)

        await fs.rmdir(root)

        strictEqual(content.toString(), '987\n654')
      })
    })
  })
})
