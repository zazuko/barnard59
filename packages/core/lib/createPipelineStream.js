const createBaseStream = require('./createBaseStream')
const Pipeline = require('./Pipeline')

function createPipelineStream (node, { basePath = process.cwd(), context = {}, variables = new Map(), loaderRegistry, log } = {}) {
  const pipeline = new Pipeline(node, {
    basePath,
    context,
    variables,
    loaderRegistry,
    log
  })

  const stream = createBaseStream(pipeline)

  stream._pipeline = pipeline

  stream.clone = ({ basePath, context, objectMode, variables, log }) => {
    return createPipelineStream(pipeline.node, {
      basePath: basePath || pipeline.basePath,
      context: context || pipeline.context,
      variables: variables || pipeline.variables,
      loaderRegistry: pipeline.loaderRegistry,
      log
    })
  }

  const properties = ['basePath', 'context', 'node', 'variables']

  properties.forEach(property => {
    Object.defineProperty(stream, property, {
      get: () => pipeline[property],
      set: (value) => {
        pipeline[property] = value
      }
    })
  })

  return stream
}

module.exports = createPipelineStream
