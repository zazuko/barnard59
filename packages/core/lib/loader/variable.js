const cf = require('clownface')
const ns = require('../namespaces')

function loader (term, dataset, { variables }) {
  const node = cf(dataset).node(term)

  if (term.termType === 'Literal') {
    return variables.get(term.value)
  }

  const name = node.out(ns.p('name')).value

  // load from the variables Map
  if (variables.has(name)) {
    return variables.get(name)
  }

  // load term from value triple and attach name
  return Object.assign({ name }, node.out(ns.p('value')).term)
}

loader.register = registry => {
  registry.registerNodeLoader(ns.p('Variable'), loader)
  registry.registerLiteralLoader(ns.p('VariableName'), loader)
}

module.exports = loader
