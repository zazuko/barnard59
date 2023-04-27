import clownface from 'clownface'
import rdf from 'rdf-ext'
// eslint-disable-next-line import/default
import ecmaScriptModuleLoader from 'rdf-loader-code/ecmaScriptModule.js'

async function promisedEcmaScriptLoader(...args) {
  return ecmaScriptModuleLoader.call(this, ...args)
}

promisedEcmaScriptLoader.register = registry => {
  registry.registerNodeLoader('http://example.org/DeferredEcmaScript', promisedEcmaScriptLoader)
}

async function promisedUrlLoader({ term, dataset }) {
  return clownface({ dataset, term })
    .out(rdf.namedNode('http://example.org/url'))
    .value
}

promisedUrlLoader.register = registry => {
  registry.registerNodeLoader('http://example.org/PromisedUrl', promisedUrlLoader)
}

export {
  promisedEcmaScriptLoader,
  promisedUrlLoader,
}
