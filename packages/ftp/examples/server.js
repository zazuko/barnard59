const { resolve } = require('path')
const FtpServer = require('../test/support/FtpServer')

async function main () {
  const server = new FtpServer({
    path: resolve(__dirname, '../test/support/data'),
    user: 'test',
    password: '1234'
  })

  await server.start()

  process.on('SIGINT', async () => {
    await server.stop()
  })
}

main()
