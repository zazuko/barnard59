import type { GetInit } from './lib/fetch.js'
import fetch from './lib/fetch.js'

function get(options: GetInit) {
  return fetch(options)
}

export default get
