import type { NamedNode, DatasetCore, Term, Stream, Quad, BlankNode } from '@rdfjs/types'
import once from 'lodash/once.js'
import { Transform } from 'readable-stream'
import type { AnyPointer } from 'clownface'
import type { Environment } from 'barnard59-env'
import type { Context as BarnardContext } from 'barnard59-core'
import urlJoin from '../../urlJoin.js'
import Cube from './Cube.js'

interface Context {
  dataset: DatasetCore
  ptr: AnyPointer
  observationSet: Term
  term: NamedNode
  shape: Term
  cube: Cube
}

interface CubeIdCallback {
  (context: Context): NamedNode
}

interface ShapeIdCallback {
  (context: Context): NamedNode
}
interface PropertyShapeIdCallback {
  (cube: Cube): NamedNode | BlankNode
}

function defaultCube(this: { rdf: Environment }, { observationSet }: Context) {
  const observationSetIri = observationSet && observationSet.value

  if (!observationSetIri) {
    return null
  }

  return this.rdf.namedNode(urlJoin(observationSetIri, '..'))
}

function defaultShape(this: { rdf: Environment }, { term }: Context) {
  const cubeIri = term && term.value

  if (!cubeIri) {
    return null
  }

  return this.rdf.namedNode(urlJoin(cubeIri, 'shape'))
}

interface Options {
  excludeValuesOf?: string[]
  cube?: CubeIdCallback
  metadata?: Stream
  shape?: ShapeIdCallback
  graph?: NamedNode
  propertyShapeId?: PropertyShapeIdCallback
  inListMaxSize?: number
}

class CubeShapeBuilder extends Transform {
  declare rdf: Environment
  declare options: {
    excludeValuesOf: Set<Term>
    cubes: Map<Term, Cube>
    cube: CubeIdCallback
    metadataStream?: Stream
    metadata: DatasetCore
    shape: ShapeIdCallback
    graph?: NamedNode
    propertyShapeId: PropertyShapeIdCallback
    inListMaxSize?: number
  }

  declare init: () => Promise<void>

  constructor({ rdf, cube, shape, excludeValuesOf, metadata, graph, propertyShapeId, inListMaxSize }: Options & { rdf: Environment }) {
    super({ objectMode: true })

    this.rdf = rdf
    this.options = {
      cubes: this.rdf.termMap(),
      cube: (cube || defaultCube).bind({ rdf }),
      excludeValuesOf: this.rdf.termSet(excludeValuesOf ? excludeValuesOf.map(v => this.rdf.namedNode(v)) : []),
      metadataStream: metadata,
      shape: (shape || defaultShape).bind({ rdf }),
      graph,
      propertyShapeId,
      inListMaxSize,
    } as unknown as typeof this.options

    this.init = once(() => this._init())
  }

  async _init() {
    if (this.options.metadataStream) {
      this.options.metadata = await this.rdf.dataset().import(this.options.metadataStream)
    } else {
      this.options.metadata = this.rdf.dataset()
    }
  }

  async _transform(chunk: Quad[], encoding: string, callback: (err: Error | null, chunk?: Quad[]) => void) {
    try {
      await this.init()
    } catch (err: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
      return callback(err)
    }

    const dataset = this.rdf.dataset([...chunk])

    const context = {
      dataset,
      ptr: this.rdf.clownface({ dataset }).has(this.rdf.ns.rdf.type, this.rdf.ns.cube.Observation),
    } as unknown as Context

    context.observationSet = context.ptr.in(this.rdf.ns.cube.observation).term!
    context.term = this.options.cube(context)
    context.shape = this.options.shape(context)
    context.cube = this.options.cubes.get(context.term)!

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

  _flush(callback: () => void) {
    for (const cube of this.options.cubes.values()) {
      const dataset = cube.toDataset({ shapeGraph: this.toNamedNode(this.options.graph) })
      this.push(dataset)
    }

    callback()
  }

  toNamedNode(item: NamedNode | string | undefined) {
    return typeof item === 'string' ? this.rdf.namedNode(item) : item
  }
}

function buildCubeShape(this: BarnardContext, { cube, shape, excludeValuesOf, metadata, graph, propertyShapeId, inListMaxSize }:{
  cube?: CubeIdCallback
  shape?: ShapeIdCallback
  excludeValuesOf?: string[]
  metadata?: Stream
  graph?: NamedNode
  propertyShapeId?: PropertyShapeIdCallback
  inListMaxSize?: number
} = {}) {
  return new CubeShapeBuilder({ rdf: this.env, cube, shape, excludeValuesOf, metadata, graph, propertyShapeId, inListMaxSize })
}

export default buildCubeShape
