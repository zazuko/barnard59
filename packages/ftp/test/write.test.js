import { strictEqual } from 'node:assert'
import fs from 'node:fs'
import { dirname, resolve } from 'node:path'
import write from '../write.js'
import { withServer } from './support/server.js'
import ftpConfigurations from './support/serverConfigurations.js'
import { finished } from './support/stream.js'

export const __dirname = dirname(new URL(import.meta.url).pathname)

describe('write', () => {
  ftpConfigurations.forEach(
    ([label, serverFactory, additionalOptions]) => {
      it(`writes file at the given path ${label}`, async () => {
        await withServer(serverFactory, async server => {
          const options = { ...server.options, ...additionalOptions }

          const stream = await write({ filename: 'tmp/foo.txt', ...options })
          const input = fs.createReadStream(resolve(__dirname, 'support/data/xyz.txt'))
          input.pipe(stream)

          await finished(stream)
        })

        strictEqual(fs.readFileSync(resolve(__dirname, 'support/tmp/foo.txt')).toString(), '987\n654')
      })

      afterEach(() => {
        if (fs.existsSync(resolve(__dirname, 'support/tmp/foo.txt'))) {
          fs.rmSync(resolve(__dirname, 'support/tmp/foo.txt'))
        }
      })
    })
})
