import { createReadStream } from 'fs'
import path from 'path'

export function openFromCsvw (csvwPath) {
  const csvw = require(`../${csvwPath}`)

  return createReadStream(path.resolve(__dirname, csvw.url))
}
