/**
 * @overload
 * @param {import('barnard59-env').Environment} rdf
 * @param {string | import('@rdfjs/types').NamedNode} item
 * @returns {import('@rdfjs/types').NamedNode}
 */
/**
 * @overload
 * @param {import('barnard59-env').Environment} rdf
 * @param {string | import('@rdfjs/types').NamedNode | undefined} item
 * @returns {import('@rdfjs/types').NamedNode | undefined}
 */

/**
 @param {import('barnard59-env').Environment} rdf
 * @param {string | import('@rdfjs/types').NamedNode | undefined} item
 * @returns {import('@rdfjs/types').NamedNode | undefined}
 */
export default function (rdf, item) {
  if (item === undefined) {
    return undefined
  }
  return typeof item === 'string' ? rdf.namedNode(item) : item
}
