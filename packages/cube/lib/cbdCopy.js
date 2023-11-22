function cbdCopy(rdf, source, target, { ignore = rdf.termSet() } = {}) {
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
