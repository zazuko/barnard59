const path = require('path')

function removeFilePart (dirname) {
  return path.parse(dirname).dir
}

module.exports = {
  removeFilePart
}
