const clownface = require('clownface')
const rdf = require('rdf-ext')
const Pipeline = require('./pipeline')
const jsLoader = require('./loader/ecmaScript')
const templateStringLoader = require('./loader/ecmaScriptLiteral')
const pipelineLoader = require('./loader/pipeline')
const variableLoader = require('./loader/variable')
const LoaderRegistry = require('./loader/registry')

function pipelineNode (definition, iri) {
  if (!iri) {
    throw new Error('expected a pipeline IRI')
  }

  return clownface(definition, rdf.namedNode(iri.value || iri.toString()))
}

function create (definition, iri, { basePath, context, objectMode, variables, additionalLoaders = [] } = {}) {
  const defaultLoaders = [
    jsLoader,
    pipelineLoader,
    templateStringLoader,
    variableLoader
  ]

  const loaders = [ ...defaultLoaders, ...additionalLoaders ]

  const loaderRegistry = loaders.reduce((registry, loader) => {
    loader.register(registry)
    return registry
  }, new LoaderRegistry())

  return new Pipeline(pipelineNode(definition, iri), { basePath, context, objectMode, variables, loaderRegistry })
}

module.exports = create
