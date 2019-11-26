const fs = require('fs')
const rimraf = require('rimraf')
const { promisify } = require('util')

const copyFile = promisify(fs.copyFile)
const createReadStream = fs.createReadStream
const mkdir = promisify(fs.mkdir)
const readFile = promisify(fs.readFile)
const rmdir = promisify(rimraf)

module.exports = {
  ...fs,
  copyFile,
  createReadStream,
  mkdir,
  readFile,
  rmdir
}
