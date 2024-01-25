import once from 'lodash/once.js'
import { Transform } from 'readable-stream'
import urlJoin from '../../urlJoin.js'
import Cube from './Cube.js'

function defaultCube({ observationSet }) {
  const observationSetIri = observationSet && observationSet.value

  if (!observationSetIri) {
    return null
  }

  return this.rdf.namedNode(urlJoin(observationSetIri, '..'))
}

function defaultShape({ term }) {
  const cubeIri = term && term.value

  if (!cubeIri) {
    return null
  }

  return this.rdf.namedNode(urlJoin(cubeIri, 'shape'))
}

class CubeShapeBuilder extends Transform {
  constructor({ rdf, excludeValuesOf, metadata, graph, propertyShapeId, inListMaxSize, targetFile } = {}) {
    super({ objectMode: true })

    this.rdf = rdf
    this.options = {
      cubes: this.rdf.termMap(),
      cube: defaultCube.bind({ rdf }),
      excludeValuesOf: this.rdf.termSet(excludeValuesOf ? excludeValuesOf.map(v => this.rdf.namedNode(v)) : []),
      metadataStream: metadata,
      shape: defaultShape.bind({ rdf }),
      graph,
      propertyShapeId,
      inListMaxSize,
      targetFile,
    }

    this.init = once(() => this._init())
  }

  async _init() {
    if (this.options.metadataStream) {
      this.options.metadata = await this.rdf.dataset().import(this.options.metadataStream)
    } else {
      this.options.metadata = this.rdf.dataset()
    }
  }

  async _transform(chunk, encoding, callback) {
    try {
      await this.init()
    } catch (err) {
      return callback(err)
    }

    const dataset = this.rdf.dataset([...chunk])

    const context = {
      dataset,
      ptr: this.rdf.clownface({ dataset }).has(this.rdf.ns.rdf.type, this.rdf.ns.cube.Observation),
    }

    context.observationSet = context.ptr.in(this.rdf.ns.cube.observation).term
    context.term = this.options.cube(context)
    context.shape = this.options.shape(context)
    context.cube = this.options.cubes.get(context.term)

    if (!context.cube) {
      context.cube = new Cube({
        rdf: this.rdf,
        term: context.term,
        metadata: this.rdf.clownface({ dataset: this.options.metadata, term: context.term }),
        observationSet: context.observationSet,
        shape: context.shape,
        propertyShapeId: this.options.propertyShapeId,
        inListMaxSize: this.options.inListMaxSize,
      })

      this.options.cubes.set(context.term, context.cube)
    }

    for (const quad of context.dataset.match(context.ptr.term)) {
      if (!this.options.excludeValuesOf.has(quad.predicate)) {
        context.cube.update(quad)
      }
    }

    callback(null, [...context.dataset])
  }

  _flush(callback) {
    // TODO: handle multiple cubes in case of targetFile
    const action = this.options.targetFile
      ? x => this.rdf.toFile(x.toStream(), this.options.targetFile)
      : x => this.push(x)

    for (const cube of this.options.cubes.values()) {
      const dataset = cube.toDataset({ shapeGraph: this.toNamedNode(this.options.graph) })
      action(dataset)
    }

    callback()
  }

  toNamedNode(item) {
    return typeof item === 'string' ? this.rdf.namedNode(item) : item
  }
}

function buildCubeShape({ excludeValuesOf, metadata, graph, propertyShapeId, inListMaxSize, targetFile } = {}) {
  return new CubeShapeBuilder({ rdf: this.env, excludeValuesOf, metadata, graph, propertyShapeId, inListMaxSize, targetFile })
}

export default buildCubeShape
