const path = require('path')

module.exports.removeFilePart = function (dirname) {
  return path.parse(dirname).dir
}
