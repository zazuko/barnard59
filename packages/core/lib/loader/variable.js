import cloneTerm from '../cloneTerm.js'
import { VariableMap } from '../VariableMap.js'

const unknownVariable = Symbol('unknown-variable')

function loader(rdf, ptr, { variables = new VariableMap() } = {}) {
  if (ptr.term.termType === 'Literal') {
    const value = variables.get(ptr.value)

    // The loader registry would fall back to the literal value if undefined is returned.
    // Using the unknownVariable symbol allows the argument factory to identify these cases.
    if (typeof value === 'undefined') {
      return unknownVariable
    }

    return value
  }

  const name = ptr.out(rdf.ns.p.name).value
  let term

  // if the variables from the arguments contains it ...
  if (variables.has(name)) {
    // ...prioritize loading it from the arguments map
    term = rdf.literal(variables.get(name))
  } else {
    // ... otherwise load the term from the dataset
    term = cloneTerm(rdf, ptr.out(rdf.ns.p.value).term)
  }

  // if there is a value, attached the name to it
  if (term) {
    term.name = name
  }

  return term
}

loader.register = (registry, rdf) => {
  registry.registerNodeLoader(rdf.ns.p.Variable, loader.bind(null, rdf))
  registry.registerLiteralLoader(rdf.ns.p.VariableName, loader.bind(null, rdf))
}

export default loader
export { unknownVariable }
