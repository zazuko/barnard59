/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Duplex } from 'node:stream'
import { PassThrough } from 'readable-stream'
import type { RequestInit } from 'node-fetch'
import nodeFetch from 'node-fetch'
import duplexify from 'duplexify'
import tracer from './tracer.js'

export type PostInit = RequestInit & { url: string }

export default async function writableFetch({ method = 'POST', url, ...options }: PostInit): Promise<Duplex> {
  const inputStream: any = new PassThrough()
  const outputStream: any = new PassThrough()

  tracer.startActiveSpan('writableFetch', span => setTimeout(async () => {
    try {
      const response = await nodeFetch(url, { method, body: inputStream, ...options })

      response.body!.pipe(outputStream)
    } catch (err) {
      outputStream.emit('error', err)
    } finally {
      span.end()
    }
  }, 0))

  return duplexify(inputStream, outputStream)
}
