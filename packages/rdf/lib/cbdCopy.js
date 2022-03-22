import TermSet from '@rdfjs/term-set'
import rdf from 'rdf-ext'

function cbdCopy (source, target, { ignore = new TermSet() } = {}) {
  for (const quad of source.dataset.match(source.term)) {
    if (ignore.has(quad.predicate)) {
      continue
    }

    target.dataset.add(rdf.quad(target.term, quad.predicate, quad.object, quad.graph))

    if (quad.object.termType === 'BlankNode') {
      cbdCopy(
        { dataset: source.dataset, term: quad.object },
        { dataset: target.dataset, term: quad.object }
      )
    }
  }
}

export default cbdCopy
