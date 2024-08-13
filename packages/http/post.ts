import type { RequestInit } from 'node-fetch'
import type { PostInit } from './lib/writableFetch.js'
import writableFetch from './lib/writableFetch.js'

function post(options: PostInit): ReturnType<typeof writableFetch>
function post(url: string, options: RequestInit): ReturnType<typeof writableFetch>
function post(urlOrOptions: PostInit | string, options: RequestInit = {}): ReturnType<typeof writableFetch> {
  if (typeof urlOrOptions === 'string') {
    return writableFetch({ ...options, url: urlOrOptions })
  }

  return writableFetch(urlOrOptions)
}

export default post
