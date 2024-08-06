import type { PostInit } from './lib/writableFetch.js'
import writableFetch from './lib/writableFetch.js'

function post(options: PostInit) {
  return writableFetch(options)
}

export default post
