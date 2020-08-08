const { join } = require('path')
const { URL } = require('url')

function urlJoin (base, part) {
  const url = new URL(base)

  url.pathname = join(url.pathname, part)

  return url.toString()
}

module.exports = urlJoin
