import rdf from 'rdf-ext'
import * as ns from '../namespaces.js'
import { xsd } from '../namespaces.js'
import { wellKnownDatasetClasses, wellKnownDatasetClassesWithDcterms } from './datasetClasses.js'
import { namedDateLiterals } from './namedDateLiterals.js'

function subjectsWithDatasetType (dataset, classes) {
  const result = rdf.termSet()
  dataset
    .filter(quad => (quad.predicate.equals(ns.rdf.type) && classes.has(quad.object)))
    .forEach(quad => {
      result.add(quad.subject)
    })
  return result
}

function updateOrInsert (dataset, datasetClasses, predicate, object) {
  const targetSubjects = subjectsWithDatasetType(dataset, datasetClasses)

  // Remove existent
  dataset = dataset.filter(quad => {
    return !(quad.predicate.equals(predicate) && targetSubjects.has(quad.subject))
  })

  // Append
  for (const subject of targetSubjects) {
    dataset.add(rdf.quad(subject, predicate, object))
  }

  return dataset
}

function toDateLiteral (item) {
  return typeof item === 'string' ? rdf.literal(item, xsd.dateTime) : item
}

function toNamedNode (item) {
  return typeof item === 'string' ? rdf.namedNode(item) : item
}

function resolveNamedDate (value, metadata) {
  return namedDateLiterals.has(value) ? namedDateLiterals.get(value)(metadata) : toDateLiteral(value)
}

async function applyOptions (quadStream, metadata = {}, options = {}) {
  let dataset = await rdf.dataset().import(quadStream)

  // dateModified
  if (options.dateModified) {
    const dateModifiedLiteral = resolveNamedDate(options.dateModified, metadata)

    dataset = updateOrInsert(dataset, wellKnownDatasetClassesWithDcterms, ns.dcterms.modified, dateModifiedLiteral)
    dataset = updateOrInsert(dataset, wellKnownDatasetClasses, ns.schema.dateModified, dateModifiedLiteral)
  }

  // dateCreated
  if (options.dateCreated) {
    const dateCreatedLiteral = resolveNamedDate(options.dateCreated, metadata)
    dataset = updateOrInsert(dataset, wellKnownDatasetClassesWithDcterms, ns.dcterms.created, dateCreatedLiteral)
    dataset = updateOrInsert(dataset, wellKnownDatasetClasses, ns.schema.dateCreated, dateCreatedLiteral)
  }

  // Sets graph
  if (options.graph) {
    dataset = dataset.map(quad => rdf.quad(quad.subject, quad.predicate, quad.object, toNamedNode(options.graph)))
  }

  return dataset
}

export { applyOptions }
