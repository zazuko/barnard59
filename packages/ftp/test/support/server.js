export async function withServer (serverFactory, callback) {
  const server = serverFactory()
  await server.start()

  try {
    await callback(server)
  } finally {
    await server.stop()
  }
}
