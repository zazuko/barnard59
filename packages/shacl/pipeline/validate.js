import { shacl } from '../report.js'

/**
 * @this {import('barnard59-core').Context}
 */
export default function () {
  const { variables } = this

  if (variables.has('shapes')) {
    const shapesPipeline = this.createPipeline(this.graph.namedNode('https://barnard59.zazuko.com/pipeline/shacl/_getShapes'), { variables })
    return shacl.call(this, shapesPipeline.stream)
  }

  return shacl.call(this)
}
