import clownface from 'clownface'
import rdf from 'rdf-ext'
import ecmaScriptLoader from 'rdf-loader-code/ecmaScript.js'

async function promisedEcmaScriptLoader (...args) {
  return ecmaScriptLoader.call(this, ...args)
}

promisedEcmaScriptLoader.register = registry => {
  registry.registerNodeLoader('http://example.org/DeferredEcmaScript', promisedEcmaScriptLoader)
}

async function promisedUrlLoader ({ term, dataset }) {
  return clownface({ dataset, term })
    .out(rdf.namedNode('http://example.org/url'))
    .value
}

promisedUrlLoader.register = registry => {
  registry.registerNodeLoader('http://example.org/PromisedUrl', promisedUrlLoader)
}

export {
  promisedEcmaScriptLoader,
  promisedUrlLoader
}
