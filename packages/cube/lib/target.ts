import type { Context } from 'barnard59-core'
import type { DatasetCore } from '@rdfjs/types'

export const addTarget = function (this: Context, shape: DatasetCore) {
  const constraint = this.env.clownface({ dataset: shape, term: this.env.ns.cube.Constraint }).in(this.env.ns.rdf.type)
  if (!constraint.term) {
    throw new Error('could not find a unique constraint')
  }
  constraint.addOut(this.env.ns.sh.targetClass, this.env.ns.cube.Observation)
  return shape
}
