import { strictEqual } from 'assert'
import { resolve, dirname } from 'path'
import getStream from 'get-stream'
import { describe, it } from 'mocha'
import { Readable } from 'readable-stream'
import move from '../move.js'
import fs from './support/fs.js'
import FtpServer from './support/FtpServer.js'
import { withServer } from './support/server.js'
import SftpServer from './support/SftpServer.js'

const __dirname = dirname(new URL(import.meta.url).pathname)

describe('move', () => {
  it('is a function', () => {
    strictEqual(typeof move, 'function')
  })

  ;[
    [
      'on a FTP server with anonymous user',
      () => new FtpServer(),
      {}
    ],
    [
      'on a FTP server with username/password',
      () => new FtpServer({ user: 'test', password: '1234' }),
      {}
    ],
    [
      'on a SFTP server with anonymous user',
      () => new SftpServer(),
      {}
    ],
    [
      'on a SFTP server with username/password',
      () => new SftpServer({ user: 'test', password: '1234' }),
      {}
    ],
    [
      'on a SFTP server with private key',
      () => new SftpServer({ user: 'test', password: '1234' }),
      { password: undefined, privateKey: fs.readFileSync('test/support/test.key') }
    ]
  ].forEach(([label, serverFactory, additionalOptions]) => {
    it(`moves a file from the given place to another place ${label}`, async () => {
      await withServer(serverFactory, async server => {
        const options = { ...server.options, ...additionalOptions }

        const root = resolve(__dirname, 'support/tmp/move')
        const original = resolve(__dirname, 'support/data/xyz.txt')
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
