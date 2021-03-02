import fetch from './lib/fetch.js'
import writableFetch from './lib/writableFetch.js'

export function get (options) {
  return fetch(options)
}

export function post (options) {
  return writableFetch(options)
}

export { default as fetch } from './lib/fetch.js'
export { default as writableFetch } from './lib/writableFetch.js'
