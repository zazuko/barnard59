// Corresponds to rdf-code-loader resolvers:
// https://github.com/zazuko/rdf-loader-code/blob/c5137d45f13c6788f9f6f161653b7cd800401a0f/lib/iriResolve.js#L4-L17
// Required for ./validators/dependency.js
module.exports.dependencyTypes = {
  'node:': 'package',
  'file:': 'file'
}

// List of packages for which the manifest location is known and needs to be overridden
// Required for ./utils.js#getManifestPath
module.exports.manifestLocation = {
  fs: 'barnard59-core'
}
