/* eslint-disable @typescript-eslint/no-explicit-any */
import { SpanStatusCode } from '@opentelemetry/api'
import toReadable from 'duplex-to/readable.js'
import type { RequestInit } from 'node-fetch'
import nodeFetch from 'node-fetch'
import tracer from './tracer.js'

export type GetInit = RequestInit & { url: string }

export default async function fetch({ method = 'GET', url, ...options }: GetInit) {
  return await tracer.startActiveSpan('fetch', async span => {
    try {
      const response = await nodeFetch(url, { method, ...options })

      return toReadable(response.body as any)
    } catch (e: any) {
      span.recordException(e)
      span.setStatus({ code: SpanStatusCode.ERROR, message: e.message })
    } finally {
      span.end()
    }
  })
}
