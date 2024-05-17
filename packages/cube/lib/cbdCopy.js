/**
 * @typedef {Pick<import('clownface').GraphPointer<import('@rdfjs/types').NamedNode | import('@rdfjs/types').BlankNode>, 'dataset' | 'term'>} GraphPointerLike
 */

/**
 * @param {import('barnard59-env').Environment} rdf
 * @param {GraphPointerLike} source
 * @param {GraphPointerLike} target
 * @param {object} [options]
 * @param {import('@rdfjs/term-set').default<import('rdf-js').NamedNode>} [options.ignore]
 */
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
