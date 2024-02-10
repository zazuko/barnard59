import { readFileSync } from 'fs'
import { dirname, resolve } from 'path'
import FtpServer from './FtpServer.js'
import SftpServer from './SftpServer.js'

export const base = dirname(new URL(import.meta.url).pathname)

export const ftpConfigurations = [
  [
    'on a FTP server with anonymous user',
    () => new FtpServer(),
    {},
  ],
  [
    'on a FTP server with username/password',
    () => new FtpServer({ user: 'test', password: '1234' }),
    {},
  ],
]

export const sftpConfigurations = [
  [
    'on a SFTP server with anonymous user',
    () => new SftpServer(),
    {},
  ],
  [
    'on a SFTP server with username/password',
    () => new SftpServer({ user: 'test', password: '1234' }),
    {},
  ],
  [
    'on a SFTP server with private key',
    () => new SftpServer({ user: 'test', password: '1234' }),
    { password: undefined, privateKey: readFileSync(resolve(base, 'test.key')) },
  ], [
    'on a SFTP server with private key specified as a file',
    () => new SftpServer({ user: 'test', password: '1234' }),
    { password: undefined, privateKey: resolve(base, 'test.key') },
  ],
]

export default [
  ...ftpConfigurations,
  ...sftpConfigurations,
]
