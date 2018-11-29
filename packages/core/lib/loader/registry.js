const ns = require('../namespaces')

function getTypeIri (typeOrNode) {
  let typeIri

  if (typeof typeOrNode === 'string') {
    typeIri = typeOrNode
  } else if (typeOrNode.termType === 'NamedNode') {
    typeIri = typeOrNode.value
  }

  if (!typeIri) {
    throw new Error('Unrecognized type to register. It must be string or rdf.NamedNode')
  }

  return typeIri
}

class LoaderRegistry {
  constructor () {
    this._literalLoaders = new Map()
    this._nodeLoaders = new Map()
  }

  registerLiteralLoader (type, loader) {
    this._literalLoaders.set(getTypeIri(type), loader)
  }

  registerNodeLoader (type, loader) {
    this._nodeLoaders.set(getTypeIri(type), loader)
  }

  load (node, context, variables) {
    let loader

    if (node.term.termType === 'Literal') {
      loader = this._literalLoaders.get(node.term.datatype.value)
    } else {
      loader = this._nodeLoaders.get(node.out(ns.rdf('type')).value)
    }

    if (loader) {
      return loader(node.term, node.dataset, context, variables)
    }

    return null
  }
}

module.exports = LoaderRegistry
