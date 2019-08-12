const jsLoader = require('rdf-loader-code/ecmaScript')
const pipelineLoader = require('./loader/pipeline')
const templateStringLoader = require('rdf-loader-code/ecmaScriptLiteral')
const variableLoader = require('./loader/variable')
const LoaderRegistry = require('rdf-loaders-registry')

const defaultLoaders = [
  jsLoader,
  pipelineLoader,
  templateStringLoader,
  variableLoader
]

function createLoaderRegistry (additionalLoaders = []) {
  const loaders = [ ...defaultLoaders, ...additionalLoaders ]

  return loaders.reduce((registry, loader) => {
    loader.register(registry)
    return registry
  }, new LoaderRegistry())
}

module.exports = createLoaderRegistry
