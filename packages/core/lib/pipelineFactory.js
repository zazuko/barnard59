const clownface = require('clownface')
const createLoaderRegistry = require('./createLoaderRegistry')
const createPipelineStream = require('./createPipelineStream')
const rdf = require('rdf-ext')

function pipelineNode (definition, iri) {
  if (!iri) {
    throw new Error('expected a pipeline IRI')
  }

  return clownface(definition, rdf.namedNode(iri.value || iri.toString()))
}

function create (definition, iri, { basePath, context, variables, additionalLoaders = [] } = {}) {
  const loaderRegistry = createLoaderRegistry(additionalLoaders)

  return createPipelineStream(pipelineNode(definition, iri), { basePath, context, variables, loaderRegistry })
}

module.exports = create
