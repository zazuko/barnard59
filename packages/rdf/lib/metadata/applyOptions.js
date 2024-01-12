import rdf from 'barnard59-env'
import { wellKnownDatasetClasses, wellKnownDatasetClassesWithDcterms } from './datasetClasses.js'
import { namedDateLiterals } from './namedDateLiterals.js'

/**
 * @param {import('@rdfjs/types').DatasetCore} dataset
 * @param {Set<import('@rdfjs/types').Term>} classes
 * @return {Set<import('@rdfjs/types').Quad_Subject>}
 */
function subjectsWithDatasetType(dataset, classes) {
  /**
   * @type {Set<import('@rdfjs/types').Quad_Subject>}
   */
  const result = rdf.termSet()
  ;[...dataset]
    .filter(quad => (quad.predicate.equals(rdf.ns.rdf.type) && classes.has(quad.object)))
    .forEach(quad => {
      result.add(quad.subject)
    })
  return result
}

/**
 * @param {import('@rdfjs/types').DatasetCore} dataset
 * @param {Set<import('@rdfjs/types').Term>} datasetClasses
 * @param {import('@rdfjs/types').Quad_Predicate} predicate
 * @param {import('@rdfjs/types').Quad_Object} object
 * @return {import('@rdfjs/types').DatasetCore}
 */
function updateOrInsert(dataset, datasetClasses, predicate, object) {
  const targetSubjects = subjectsWithDatasetType(dataset, datasetClasses)

  // Remove existent
  dataset = rdf.dataset([...dataset].filter(quad => {
    return !(quad.predicate.equals(predicate) && targetSubjects.has(quad.subject))
  }))

  // Append
  for (const subject of targetSubjects) {
    dataset.add(rdf.quad(subject, predicate, object))
  }

  return dataset
}

/**
 * @param {string | import('@rdfjs/types').NamedNode | undefined} item
 * @return {import('@rdfjs/types').NamedNode | undefined}
 */
function toNamedNode(item) {
  return typeof item === 'string' ? rdf.namedNode(item) : item
}

/**
 * @param {import('@rdfjs/types').Literal | import('./namedDateLiterals.js').NamedDateLiteral} value
 * @param {import('./namedDateLiterals.js').Metadata} metadata
 * @return {import('@rdfjs/types').Literal}
 */
function resolveNamedDate(value, metadata) {
  if (typeof value !== 'string') {
    return value
  }

  const factory = namedDateLiterals.get(value)

  return factory ? factory(metadata) : rdf.literal(value, rdf.ns.xsd.dateTime)
}

/**
 * @param {import('@rdfjs/types').Stream & import('stream').EventEmitter} quadStream
 * @param {import('./namedDateLiterals.js').Metadata} [metadata]
 * @param {{
 *   dateModified?: import('./namedDateLiterals.js').NamedDateLiteral;
 *   dateCreated?: import('./namedDateLiterals.js').NamedDateLiteral;
 *   graph?: string | import('@rdfjs/types').NamedNode
 * }} [options]
 * @return {Promise<import('@rdfjs/types').DatasetCore>}
 */
async function applyOptions(quadStream, metadata = {}, options = {}) {
  /**
   * @type {import('@rdfjs/types').DatasetCore}
   */
  let dataset = await rdf.dataset().import(quadStream)

  // dateModified
  if (options.dateModified) {
    const dateModifiedLiteral = resolveNamedDate(options.dateModified, metadata)

    dataset = updateOrInsert(dataset, wellKnownDatasetClassesWithDcterms, rdf.ns.dcterms.modified, dateModifiedLiteral)
    dataset = updateOrInsert(dataset, wellKnownDatasetClasses, rdf.ns.schema.dateModified, dateModifiedLiteral)
  }

  // dateCreated
  if (options.dateCreated) {
    const dateCreatedLiteral = resolveNamedDate(options.dateCreated, metadata)
    dataset = updateOrInsert(dataset, wellKnownDatasetClassesWithDcterms, rdf.ns.dcterms.created, dateCreatedLiteral)
    dataset = updateOrInsert(dataset, wellKnownDatasetClasses, rdf.ns.schema.dateCreated, dateCreatedLiteral)
  }

  // Sets graph
  if (options.graph) {
    return rdf.dataset([...dataset].map(quad => rdf.quad(quad.subject, quad.predicate, quad.object, toNamedNode(options.graph))))
  }

  return dataset
}

export { applyOptions }
