import { join } from 'path'
import { URL } from 'url'

/**
 * @param {string} base
 * @param {string} part
 */
function urlJoin(base, part) {
  const url = new URL(base)

  url.pathname = join(url.pathname, part)

  return url.toString()
}

export default urlJoin
