import parseArguments from 'rdf-loader-code/arguments.js'

async function createArguments (ptr, { basePath, context, loaderRegistry, logger, variables }) {
  return parseArguments(ptr, { basePath, context, loaderRegistry, logger, variables })
}

export default createArguments
