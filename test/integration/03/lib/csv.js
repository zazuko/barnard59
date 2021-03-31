import { createReadStream, readFileSync } from 'fs'
import path from 'path'

export function openFromCsvw (csvwPath) {

  const __dirname = process.cwd()
  const csvw = JSON.parse(readFileSync(`${__dirname}/${csvwPath}`, 'utf8'));

  return createReadStream(path.resolve(__dirname, csvw.url))
}
