import clownface from 'clownface'
import rdf from 'rdf-ext'
import fromFile from 'rdf-utils-fs/fromFile.js'
import filenamePipelineDefinition from './filenamePipelineDefinition.js'
import ns from './namespaces.js'

async function loadPipelineDefinition(name, { term = ns.ex('') } = {}) {
  const filename = filenamePipelineDefinition(name)
  const stream = fromFile(filename)
  const dataset = await rdf.dataset().import(stream)

  return clownface({ dataset, term })
}

export default loadPipelineDefinition
