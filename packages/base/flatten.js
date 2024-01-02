// @ts-check
import { obj } from 'through2'

/**
 * @callback ForEachCallback
 * @param {unknown} item
 * @return {void}
 */

/**
 * @typedef {Iterable<unknown> | { forEach(cb: ForEachCallback): void }} IterableLike
 */

/**
 * @return {import('stream').Transform} Transform
 */
function flatten() {
  return obj(function (/** IterableLike */ chunk, encoding, callback) {
    if (typeof chunk[Symbol.iterator] === 'function') {
      for (const item of chunk) {
        this.push(item)
      }

      return callback()
    }

    if (typeof chunk.forEach === 'function') {
      chunk.forEach((/** @type {unknown} */ item) => this.push(item))

      return callback()
    }

    return callback(new Error('chunk doesn\'t implement Symbol.iterator or .forEach'))
  })
}

export default flatten
