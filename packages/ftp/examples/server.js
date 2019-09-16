const { resolve } = require('path')
const FtpServer = require('../test/support/FtpServer')
const SftpServer = require('../test/support/SftpServer')

async function main () {
  const protocol = process.argv.slice(-1)[0]
  const ServerClass = getServerClass(protocol)
  const server = new ServerClass({
    path: resolve(__dirname, '../test/support/data'),
    user: 'test',
    password: '1234'
  })

  await server.start()

  process.on('SIGINT', async () => {
    await server.stop()
  })
}

function getServerClass (protocol) {
  if (protocol === 'sftp') {
    return SftpServer
  } else {
    return FtpServer
  }
}

main()
