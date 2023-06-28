import { resolve } from 'path'
import * as url from 'url'
import clownface from 'clownface'
import rdf from 'rdf-ext'
import fromFile from 'rdf-utils-fs/fromFile.js'
import namespace from '@rdfjs/namespace'

const ex = namespace('http://example.org/pipeline/')

export function pipelineDefinitionLoader(baseUrl, path = 'support/definitions') {
  const basePath = url.fileURLToPath(new URL('.', baseUrl))

  return async (name, { term = ex('') } = {}) => {
    const filename = resolve(basePath, `${path}/${name}.ttl`)
    const stream = fromFile(filename)
    const dataset = await rdf.dataset().import(stream)

    return clownface({ dataset, term })
  }
}
