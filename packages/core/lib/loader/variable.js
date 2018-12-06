const cf = require('clownface')
const ns = require('../namespaces')

function loader (term, dataset, { variables }) {
  const node = cf(dataset).node(term)

  if (term.termType === 'Literal') {
    return variables.get(term.value)
  } else {
    return variables.get(node.out(ns.p('name')).value) || node.out(ns.p('value')).value
  }
}

loader.register = registry => {
  registry.registerNodeLoader(ns.p('Variable'), loader)
  registry.registerLiteralLoader(ns.p('variable'), loader)
}

module.exports = loader
