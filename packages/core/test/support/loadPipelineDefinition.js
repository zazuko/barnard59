import { resolve } from 'path'
import clownface from 'clownface'
import rdf from 'rdf-ext'
import fromFile from 'rdf-utils-fs/fromFile.js'
import ns from './namespaces.js'

async function loadPipelineDefinition(name, { term = ns.ex('') } = {}) {
  const filename = resolve(`test/support/definitions/${name}.ttl`)
  const stream = fromFile(filename)
  const dataset = await rdf.dataset().import(stream)

  return clownface({ dataset, term })
}

export default loadPipelineDefinition
