import type { RequestInit } from 'node-fetch'
import type { GetInit } from './lib/fetch.js'
import fetch from './lib/fetch.js'

function get(options: GetInit): ReturnType<typeof fetch>
function get(url: string, options?: RequestInit): ReturnType<typeof fetch>
function get(urlOrOptions: GetInit | string, options: RequestInit = {}): ReturnType<typeof fetch> {
  if (typeof urlOrOptions === 'string') {
    return fetch({ ...options, url: urlOrOptions })
  }

  return fetch(urlOrOptions)
}

export default get
