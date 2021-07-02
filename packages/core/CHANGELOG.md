# Changelog

## 1.0.0

### Added

- Loader for ECMAScript module operations (CommonJS is still supported).

### Changed

- The package is now an ECMAScript module.
  The CommonJS interface is no longer available. 
- `forEach` is now part of `barnard59-base`.
- All variables are handled as RDF/JS Terms.
  Older versions used plain variable values given in a `Map` to the pipeline factory. 
  Variables from the pipeline definition were already handled as RDF/JS Terms.
