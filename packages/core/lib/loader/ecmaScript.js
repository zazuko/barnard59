const cf = require('clownface')
const ns = require('../namespaces')
const iriRequire = require('../iriRequire')

function parseLiteral (node, context) {
  if (node.datatype.equals(ns.code('ecmaScript'))) {
    return (function () { return eval(node.value) }).call(context) // eslint-disable-line no-eval,no-extra-parens
  }

  const err = new Error(`Cannot load ecmaScript code from node ${node}`)
  err.node = node
  throw err
}

function parseNamedNode (node, dataset, context) {
  const def = cf(dataset)
  const cfNode = def.node(node)
  const link = cfNode.out(ns.code('link'))

  if (link.term && link.term.termType === 'NamedNode') {
    return iriRequire(link.value, context.basePath)
  }

  const err = new Error(`Cannot load ecmaScript code from node ${node}`)
  err.node = node
  throw err
}

module.exports = (node, dataset, context) => {
  if (node && node.termType === 'Literal') {
    return parseLiteral(node, context)
  }

  return parseNamedNode(node, dataset, context)
}
