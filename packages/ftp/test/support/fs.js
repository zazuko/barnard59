import fs, { copyFile as _copyFile, createReadStream as _createReadStream, mkdir as _mkdir, readFile as _readFile } from 'fs'
import { promisify } from 'util'
import { rimraf as rmdir } from 'rimraf'

const copyFile = promisify(_copyFile)
const createReadStream = _createReadStream
const mkdir = promisify(_mkdir)
const readFile = promisify(_readFile)

export default {
  ...fs,
  copyFile,
  createReadStream,
  mkdir,
  readFile,
  rmdir,
}
