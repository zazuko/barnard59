import { resolve } from 'path'

const base = new URL('.', import.meta.url).pathname

function filenamePipelineDefinition(name) {
  return resolve(base, `definitions/${name}.ttl`)
}

export default filenamePipelineDefinition
