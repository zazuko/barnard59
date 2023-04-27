import rdf from 'rdf-ext'

function cloneTerm(term) {
  if (!term) {
    return null
  }

  if (term.termType === 'BlankNode') {
    return rdf.blankNode(term.value)
  }

  if (term.termType === 'Literal') {
    return rdf.literal(term.value, term.language || term.datatype)
  }

  if (term.termType === 'NamedNode') {
    return rdf.namedNode(term.value)
  }

  throw new Error(`unknown termType: ${term.termType}`)
}

export default cloneTerm
