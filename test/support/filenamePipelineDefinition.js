import { resolve } from 'path'

function filenamePipelineDefinition(name) {
  return resolve(`test/support/definitions/${name}.ttl`)
}

export default filenamePipelineDefinition
