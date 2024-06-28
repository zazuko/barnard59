import type { BlankNode, NamedNode, Term } from '@rdfjs/types'
import type { GraphPointer } from 'clownface'

import type { Environment } from 'barnard59-env'

type GraphPointerLike = Pick<GraphPointer<NamedNode | BlankNode>, 'dataset' | 'term'>

function cbdCopy(rdf: Environment, source: GraphPointerLike, target: GraphPointerLike, { ignore = rdf.termSet() }: { ignore?: Set<Term> } = {}) {
  for (const quad of source.dataset.match(source.term)) {
    if (ignore.has(quad.predicate)) {
      continue
    }

    target.dataset.add(rdf.quad(target.term, quad.predicate, quad.object, quad.graph))

    if (quad.object.termType === 'BlankNode') {
      cbdCopy(
        rdf,
        { dataset: source.dataset, term: quad.object },
        { dataset: target.dataset, term: quad.object },
      )
    }
  }
}

export default cbdCopy
