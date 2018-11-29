class LoaderRegistry {
  constructor () {
    this._literalLoaders = new Map()
    this._nodeLoaders = new Map()
  }

  registerLiteralLoader (type, loader) {
    this._literalLoaders.set(type, loader)
  }

  registerNodeLoader (type, loader) {
    this._nodeLoaders.set(type, loader)
  }
}

module.exports = LoaderRegistry
