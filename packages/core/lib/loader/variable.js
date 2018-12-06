const cf = require('clownface')
const ns = require('../namespaces')

function loader (term, dataset, { variables }) {
  const node = cf(dataset).node(term)

  return variables.get(node.out(ns.p('name')).value) || node.out(ns.p('value')).value
}

loader.register = registry => {
  registry.registerNodeLoader(ns.p('Variable'), loader)
}

module.exports = loader
