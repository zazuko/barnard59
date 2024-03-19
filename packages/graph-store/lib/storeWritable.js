import { PassThrough } from 'readable-stream'

/**
 * @param {(stream: import('readable-stream').PassThrough) => Promise<void>} openConnection
 * @param {object} context
 * @param {import('winston').Logger} context.logger
 */
export default function (openConnection, { logger }) {
  /**
   * @this {import('barnard59-core').Context}
   * @param {AsyncIterable<import('@rdfjs/types').Quad>} quads
   */
  return async function * (quads) {
    const quadStream = new PassThrough({
      objectMode: true,
    })
    let request

    for await (const quad of quads) {
      if (!request) {
        request = openConnection(quadStream)
      }

      quadStream.write(quad)
    }

    quadStream.end()

    if (!request) {
      logger?.warn('No quads sent to the server. No request was made.')
    }

    await request
  }
}
