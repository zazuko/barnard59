const clownface = require('clownface')
const rdf = require('rdf-ext')
const ns = require('./namespaces')
const Pipeline = require('./pipeline')
const jsLoader = require('./loader/ecmaScript')
const templateStringLoader = require('./loader/ecmaScriptLiteral')
const pipelineLoader = require('./loader/pipeline')
const LoaderRegistry = require('./loader/registry')

function pipelineNode (definition, iri) {
  let node

  if (iri) {
    node = clownface(definition, rdf.namedNode(iri.value || iri.toString()))
  } else {
    node = clownface(definition).has(ns.rdf('type'), ns.p('Pipeline'))
  }

  if (!node.term) {
    throw new Error('expected an existing IRI or a single Pipeline class in definition')
  }

  return node
}

function create (definition, { iri, basePath, context, objectMode, variables, additionalLoaders = [] } = {}) {
  const defaultLoaders = [
    jsLoader,
    pipelineLoader,
    templateStringLoader
  ]

  const loaders = [ ...defaultLoaders, ...additionalLoaders ]

  const loaderRegistry = loaders.reduce((registry, loader) => {
    loader.register(registry)
    return registry
  }, new LoaderRegistry())

  return new Pipeline(pipelineNode(definition, iri), { basePath, context, objectMode, variables, loaderRegistry })
}

module.exports = create
