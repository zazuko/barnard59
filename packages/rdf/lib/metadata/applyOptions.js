import rdf from 'barnard59-env'
import fromStream from 'rdf-dataset-ext/fromStream.js'
import toNamedNode from '../toNamedNode.js'
import { wellKnownDatasetClasses, wellKnownDatasetClassesWithDcterms } from './datasetClasses.js'
import { namedDateLiterals } from './namedDateLiterals.js'

function subjectsWithDatasetType(dataset, classes) {
  const result = rdf.termSet()
  ;[...dataset]
    .filter(quad => (quad.predicate.equals(rdf.ns.rdf.type) && classes.has(quad.object)))
    .forEach(quad => {
      result.add(quad.subject)
    })
  return result
}

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

function toDateLiteral(item) {
  return typeof item === 'string' ? rdf.literal(item, rdf.ns.xsd.dateTime) : item
}

function resolveNamedDate(value, metadata) {
  return namedDateLiterals.has(value) ? namedDateLiterals.get(value)(metadata) : toDateLiteral(value)
}

/**
 * @param {import('@rdfjs/types').Stream & import('stream').EventEmitter} quadStream
 * @param metadata
 * @param options
 * @return {Promise<import('@rdfjs/types').DatasetCore>}
 */
async function applyOptions(quadStream, metadata = {}, options = {}) {
  let dataset = await fromStream(rdf.dataset(), quadStream)

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
    return rdf.dataset([...dataset].map(quad => rdf.quad(quad.subject, quad.predicate, quad.object, toNamedNode(rdf, options.graph))))
  }

  return dataset
}

export { applyOptions }
