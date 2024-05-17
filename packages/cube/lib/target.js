/**
 * @this {import('barnard59-core').Context}
 * @param {import('@rdfjs/types').DatasetCore} shape
 */
export const addTarget = function (shape) {
  const constraint = this.env.clownface({ dataset: shape, term: this.env.ns.cube.Constraint }).in(this.env.ns.rdf.type)
  if (!constraint.term) {
    throw new Error('could not find a unique constraint')
  }
  constraint.addOut(this.env.ns.sh.targetClass, this.env.ns.cube.Observation)
  return shape
}
