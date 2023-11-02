import rdf from '@zazuko/env-node'

const cube = rdf.namespace('https://cube.link/')

export const addTarget = shape => {
  const constraint = rdf.clownface({ dataset: shape, term: cube.Constraint }).in(rdf.ns.rdf.type)
  if (!constraint.term) {
    throw new Error('could not find a unique constraint')
  }
  constraint.addOut(rdf.ns.sh.targetClass, cube.Observation)
  return shape
}
