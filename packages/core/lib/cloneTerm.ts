import type { Term } from 'rdf-js'
import type { Environment } from 'barnard59-env'

function cloneTerm<T extends Term>(rdf: Environment, term: T | null | undefined): T | null {
  if (!term) {
    return null
  }

  if (term.termType === 'BlankNode') {
    return <T>rdf.blankNode(term.value)
  }

  if (term.termType === 'Literal') {
    return <T>rdf.literal(term.value, term.language || term.datatype)
  }

  if (term.termType === 'NamedNode') {
    return <T>rdf.namedNode(term.value)
  }

  throw new Error(`unknown termType: ${term.termType}`)
}

export default cloneTerm
