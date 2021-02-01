const fs = require('fs')
const files = fs.readdirSync(__dirname)

for (const file of files) {
  const func = file.replace('.js', '')
  module.exports[func] = require('./' + func)
}
