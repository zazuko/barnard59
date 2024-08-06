/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Duplex } from 'node:stream'
import { PassThrough, Readable } from 'node:stream'
import duplexify from 'duplexify'
import tracer from './tracer.js'

export type PostInit = RequestInit & { url: string }

export default async function writableFetch({ method = 'POST', url, ...options }: PostInit): Promise<Duplex> {
  const inputStream: any = new PassThrough()
  const outputStream = new PassThrough()

  tracer.startActiveSpan('writableFetch', span => setTimeout(async () => {
    try {
      const response = await fetch(url, { method, body: inputStream, ...options })

      Readable.fromWeb(response.body as any).pipe(outputStream)
    } catch (err) {
      outputStream.emit('error', err)
    } finally {
      span.end()
    }
  }, 0))

  return duplexify(inputStream, outputStream)
}
