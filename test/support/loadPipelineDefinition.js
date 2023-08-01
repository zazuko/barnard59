import { resolve } from 'path'
import * as url from 'url'
import rdf from '@zazuko/env'
import fromFile from 'rdf-utils-fs/fromFile.js'
import namespace from '@rdfjs/namespace'
import fromStream from 'rdf-dataset-ext/fromStream.js'

const ex = namespace('http://example.org/pipeline/')

export function pipelineDefinitionLoader(baseUrl, path = 'support/definitions') {
  const basePath = url.fileURLToPath(new URL('.', baseUrl))

  return async (name, { term = ex('') } = {}) => {
    const filename = resolve(basePath, `${path}/${name}.ttl`)
    const stream = fromFile(filename)
    const dataset = await fromStream(rdf.dataset(), stream)

    return rdf.clownface({ dataset, term })
  }
}
