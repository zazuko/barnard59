import rdf from 'barnard59-env'
import { Transform } from 'readable-stream'
import * as ns from './namespaces.js'

class AddRelations extends Transform {
  /**
   * @param {import('barnard59-core').Context} context
   * @param {object} options
   * @param {(targetUri: string | import('@rdfjs/types').NamedNode) => import('@rdfjs/types').Quad} options.createRelation
   * @param {import('@rdfjs/types').Quad[]} options.additionalQuads
   * @param {import('@rdfjs/term-set').default} options.classes
   */
  constructor(context, {
    createRelation,
    additionalQuads,
    classes,
  }) {
    super({ objectMode: true })
    this.classes = classes
    this.createRelation = createRelation
    this.additionalQuads = additionalQuads
  }

  /**
   * @param {import('@rdfjs/types').Quad} chunk
   * @param {string} encoding
   * @param {import('stream').TransformCallback} callback
   */
  _transform(chunk, encoding, callback) {
    if (chunk.predicate.equals(ns.rdf.type) && this.classes.has(chunk.object) && chunk.subject.termType === 'NamedNode') {
      const quad = this.createRelation(chunk.subject)
      this.push(quad)
    }
    callback(null, chunk)
  }

  /**
   * @param {import('stream').TransformCallback} callback
   */
  async _flush(callback) {
    this.additionalQuads.forEach(quad => this.push(quad))
    callback()
  }
}

/**
 * @param {string|import('@rdfjs/types').NamedNode} item
 * @return {import('@rdfjs/types').NamedNode}
 */
const toNamedNode = item => typeof item === 'string' ? rdf.namedNode(item) : item

/**
 * @this {import('barnard59-core').Context}
 * @param {object} options
 * @param {string | import('@rdfjs/types').NamedNode} options.targetUri
 * @param {string | import('@rdfjs/types').NamedNode} options.targetClass
 * @param {string | import('@rdfjs/types').NamedNode} options.property
 * @param {(string | import('@rdfjs/types').NamedNode)[]} options.classes
 * @return {Transform}
 */
function toTarget({
  targetUri,
  targetClass,
  property,
  classes = [],
}) {
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
    classes: rdf.termSet(classes.map(toNamedNode)),
  })
}

/**
 * @this {import('barnard59-core').Context}
 * @param {object} options
 * @param {string | import('@rdfjs/types').NamedNode} options.sourceUri
 * @param {string | import('@rdfjs/types').NamedNode} options.sourceClass
 * @param {string | import('@rdfjs/types').NamedNode} options.property
 * @param {(string | import('@rdfjs/types').NamedNode)[]} options.classes
 * @return {Transform}
 */
function fromSource({
  sourceUri,
  sourceClass,
  property,
  classes = [],
}) {
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
    classes: rdf.termSet(classes.map(toNamedNode)),
  })
}

export { toTarget, fromSource }
