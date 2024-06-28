/* eslint-disable no-use-before-define */
import { isResource } from 'is-graph-pointer'
import type { Environment } from 'barnard59-env'
import type { GraphPointer } from 'clownface'
import type { BlankNode, NamedNode, Term, Quad_Predicate as Predicate } from '@rdfjs/types'
import cbdCopy from '../../cbdCopy.js'
import datatypeParsers from './datatypes.js'
import { CompositeConstraintBuilder } from './constraintBuilder/CompositeConstraintBuilder.js'
import { DimensionConstraintsBuilder } from './constraintBuilder/DimensionConstraintsBuilder.js'
import { NodeKindConstraintBuilder } from './constraintBuilder/NodeKindConstraintBuilder.js'
import type Cube from './Cube.js'

interface DimensionOptions {
  rdf: Environment
  metadata: GraphPointer
  predicate: Predicate
  shapeId?: (cube: Cube, dimension: Dimension) => NamedNode | BlankNode
  inListMaxSize?: number
}

class Dimension {
  declare rdf: Environment
  declare metadata: GraphPointer
  declare predicate: Predicate
  declare shapeId: (cube: Cube, dimension: Dimension) => NamedNode | BlankNode
  declare constraints: CompositeConstraintBuilder
  declare messages: string[]

  constructor({ rdf, metadata, predicate, shapeId = () => rdf.blankNode(), inListMaxSize }: DimensionOptions) {
    this.rdf = rdf
    this.metadata = metadata
    this.predicate = predicate
    this.shapeId = shapeId
    this.constraints = new CompositeConstraintBuilder(
      new NodeKindConstraintBuilder(rdf),
      new DimensionConstraintsBuilder({ rdf, datatypeParsers: datatypeParsers(rdf), inListMaxSize }))
    this.messages = []
  }

  update({ object }: { object: Term }) {
    this.constraints.add(object)
  }

  toDataset({ cube, shape }: { cube: Cube; shape: Term }) {
    const dataset = this.rdf.dataset()

    const graph = this.rdf.clownface({ dataset })
    const ptr = graph.node(this.shapeId(cube, this))

    ptr
      .addIn(this.rdf.ns.sh.property, shape)
      .addOut(this.rdf.ns.sh.path, this.predicate)
      .addOut(this.rdf.ns.sh.minCount, 1)
      .addOut(this.rdf.ns.sh.maxCount, 1)

    this.constraints.build(ptr)

    ptr.out(this.rdf.ns.sh.description)
      .forEach(description => {
        this.messages.push(`${this.predicate.value}: ${description.term.value}`)
      })

    if (isResource(this.metadata)) {
      cbdCopy(this.rdf, this.metadata, ptr)
    }

    return dataset
  }
}

export default Dimension
