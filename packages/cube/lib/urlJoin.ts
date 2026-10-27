import { join } from 'node:path'
import { URL } from 'node:url'

function urlJoin(base: string, part: string) {
  const url = new URL(base)

  url.pathname = join(url.pathname, part)

  return url.toString()
}

export default urlJoin
