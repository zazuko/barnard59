import TermSet from '@rdfjs/term-set'
import rdf from 'rdf-ext'
import { Transform } from 'readable-stream'
import * as ns from './namespaces.js'

class AddRelations extends Transform {
  constructor (context, {
    createRelation,
    additionalQuads,
    classes
  }) {
    super({ objectMode: true })
    this.classes = classes
    this.createRelation = createRelation
    this.additionalQuads = additionalQuads
  }

  _transform (chunk, encoding, callback) {
    if (chunk.predicate.equals(ns.rdf.type) && this.classes.has(chunk.object)) {
      const quad = this.createRelation(chunk.subject)
      this.push(quad)
    }
    callback(null, chunk)
  }

  async _flush (callback) {
    this.additionalQuads.forEach(quad => this.push(quad))
    callback()
  }
}

const toNamedNode = item => typeof item === 'string' ? rdf.namedNode(item) : item

function toTarget ({
  targetUri,
  targetClass,
  property,
  classes = []
} = {}) {
  if (!targetUri) {
    throw new Error('Needs targetUri as parameter')
  }
  if (!targetClass) {
    throw new Error('Needs targetClass as parameter')
  }
  if (!property) {
    throw new Error('Needs property as parameter (example http://purl.org/dc/terms/hasPart)')
  }
  if (!classes.length) {
    throw new Error('Needs a list of classes to link')
  }

  return new AddRelations(this, {
    createRelation: sourceUri => rdf.quad(toNamedNode(sourceUri), toNamedNode(property), toNamedNode(targetUri)),
    additionalQuads: [rdf.quad(toNamedNode(targetUri), ns.rdf.type, toNamedNode(targetClass))],
    classes: new TermSet(classes.map(toNamedNode))
  })
}

function fromSource ({
  sourceUri,
  sourceClass,
  property,
  classes = []
} = {}) {
  if (!sourceUri) {
    throw new Error('Needs sourceUri as parameter')
  }
  if (!sourceClass) {
    throw new Error('Needs sourceClass as parameter')
  }
  if (!property) {
    throw new Error('Needs property as parameter (example http://purl.org/dc/terms/isPartOf)')
  }
  if (!classes.length) {
    throw new Error('Needs a list of classes to link')
  }

  return new AddRelations(this, {
    createRelation: targetUri => rdf.quad(toNamedNode(sourceUri), toNamedNode(property), toNamedNode(targetUri)),
    additionalQuads: [rdf.quad(toNamedNode(sourceUri), ns.rdf.type, toNamedNode(sourceClass))],
    classes: new TermSet(classes.map(toNamedNode))
  })
}

export { toTarget, fromSource }
