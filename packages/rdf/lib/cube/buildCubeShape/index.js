import TermMap from '@rdfjs/term-map'
import TermSet from '@rdfjs/term-set'
import clownface from 'clownface'
import once from 'lodash/once.js'
import $rdf from 'rdf-ext'
import { Transform } from 'readable-stream'
import * as ns from '../../namespaces.js'
import urlJoin from '../../urlJoin.js'
import Cube from './Cube.js'

function defaultCube ({ observationSet }) {
  const observationSetIri = observationSet && observationSet.value

  if (!observationSetIri) {
    return null
  }

  return $rdf.namedNode(urlJoin(observationSetIri, '..'))
}

function defaultShape ({ term }) {
  const cubeIri = term && term.value

  if (!cubeIri) {
    return null
  }

  return $rdf.namedNode(urlJoin(cubeIri, 'shape'))
}

class CubeShapeBuilder extends Transform {
  constructor ({ excludeValuesOf, metadata, graph } = {}) {
    super({ objectMode: true })

    this.options = {
      cubes: new TermMap(),
      cube: defaultCube,
      excludeValuesOf: new TermSet(excludeValuesOf ? excludeValuesOf.map(v => $rdf.namedNode(v)) : []),
      metadataStream: metadata,
      shape: defaultShape,
      graph
    }

    this.init = once(() => this._init())
  }

  async _init () {
    if (this.options.metadataStream) {
      this.options.metadata = await $rdf.dataset().import(this.options.metadataStream)
    } else {
      this.options.metadata = $rdf.dataset()
    }
  }

  async _transform (chunk, encoding, callback) {
    try {
      await this.init()
    } catch (err) {
      return callback(err)
    }

    const dataset = $rdf.dataset([...chunk])

    const context = {
      dataset,
      ptr: clownface({ dataset }).has(ns.rdf.type, ns.cube.Observation)
    }

    context.observationSet = context.ptr.in(ns.cube.observation).term
    context.term = this.options.cube(context)
    context.shape = this.options.shape(context)
    context.cube = this.options.cubes.get(context.term)

    if (!context.cube) {
      context.cube = new Cube({
        term: context.term,
        metadata: clownface({ dataset: this.options.metadata, term: context.term }),
        observationSet: context.observationSet,
        shape: context.shape
      })

      this.options.cubes.set(context.term, context.cube)
    }

    for (const quad of context.dataset.match(context.ptr.term)) {
      if (!this.options.excludeValuesOf.has(quad.predicate)) {
        context.cube.update(quad)
      }
    }

    callback(null, context.dataset.toArray())
  }

  _flush (callback) {
    for (const cube of this.options.cubes.values()) {
      const dataset = cube.toDataset({ shapeGraph: toNamedNode(this.options.graph) })
      this.push(dataset)
    }

    callback()
  }
}

function toNamedNode (item) {
  return typeof item === 'string' ? $rdf.namedNode(item) : item
}

function buildCubeShape ({ excludeValuesOf, metadata, graph } = {}) {
  return new CubeShapeBuilder({ excludeValuesOf, metadata, graph })
}

export default buildCubeShape
