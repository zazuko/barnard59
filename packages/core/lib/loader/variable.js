import rdf from 'rdf-ext'
import cloneTerm from '../cloneTerm.js'
import ns from '../namespaces.js'

function loader (ptr, { variables = new Map() } = {}) {
  if (ptr.term.termType === 'Literal') {
    return variables.get(ptr.value)
  }

  const name = ptr.out(ns.p.name).value
  let term

  // if the variables from the arguments contains it ...
  if (variables.has(name)) {
    // ...prioritize loading it from the arguments map
    term = rdf.literal(variables.get(name))
  } else {
    // ... otherwise load the term from the dataset
    term = cloneTerm(ptr.out(ns.p.value).term)
  }

  // if there is a value, attached the name to it
  if (term) {
    term.name = name
  }

  return term
}

loader.register = registry => {
  registry.registerNodeLoader(ns.p.Variable, loader)
  registry.registerLiteralLoader(ns.p.VariableName, loader)
}

export default loader
