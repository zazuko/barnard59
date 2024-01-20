import { resolve, dirname } from 'node:path'
import * as url from 'node:url'
import rdf from '@zazuko/env-node'
import namespace from '@rdfjs/namespace'
// eslint-disable-next-line import/no-extraneous-dependencies
import { desugar as desugarDefinition } from 'barnard59/lib/pipeline.js'

const ex = namespace('http://example.org/pipeline/')

export function pipelineDefinitionLoader(baseUrl, path = 'support/definitions') {
  const basePath = url.fileURLToPath(new URL('.', baseUrl))

  return async (name, { term = ex(''), logger, desugar = true } = {}) => {
    const filename = resolve(basePath, `${path}/${name}.ttl`)
    let dataset = await rdf.dataset().import(rdf.fromFile(filename))
    if (desugar) {
      dataset = await desugarDefinition(dataset, { logger, pipelinePath: filename })
    }

    return {
      ptr: rdf.clownface({ dataset, term }),
      basePath: dirname(filename),
    }
  }
}
