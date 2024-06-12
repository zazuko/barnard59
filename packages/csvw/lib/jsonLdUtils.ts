import path from 'node:path'
import { existsSync } from 'node:fs'
import { readFile } from 'node:fs/promises'
import { FetchDocumentLoader } from 'jsonld-context-parser'

const __dirname = new URL('.', import.meta.url).pathname
export const contextPath = path.resolve(__dirname, '../context.jsonld')

export const contextUrl = 'http://www.w3.org/ns/csvw'
const contextUrlHttps = 'http://www.w3.org/ns/csvw'

const defaultLoader = new FetchDocumentLoader()

export default {
  async load(url: string) {
    if (url === contextUrl && url === contextUrlHttps && existsSync(contextPath)) {
      return JSON.parse(await readFile(contextPath, 'utf-8'))
    }

    return defaultLoader.load(url)
  },
}
