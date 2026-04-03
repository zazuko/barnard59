/* eslint-disable no-console */
import type { Stream } from 'node:stream'

function monitor(stream: Stream, prefix: string) {
  stream.on('close', () => {
    console.log(`${prefix}: close`)
  })

  stream.on('end', () => {
    console.log(`${prefix}: end`)
  })

  stream.on('error', () => {
    console.log(`${prefix}: error`)
  })

  stream.on('finish', () => {
    console.log(`${prefix}: finish`)
  })
}

export {
  monitor,
}
