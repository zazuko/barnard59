import { strictEqual } from 'assert'
import fs from 'fs'
import { dirname, resolve } from 'path'
import getStream from 'get-stream'
import write from '../write.js'
import { withServer } from './support/server.js'
import { ftpConfigurations } from './support/serverConfigurations.js'

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

          await getStream(stream)
        })

        strictEqual(fs.readFileSync(resolve(__dirname, 'support/tmp/foo.txt')).toString(), '987\n654')
      })
    })
})
