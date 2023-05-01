# Changelog

## 1.2.0

### Minor Changes

- ff7d6f8: Allow annotating sensitive variables in order to avoid exposing their value in the job logs (re zazuko/barnard59#66)

### Patch Changes

- ff7d6f8: Variables from sub-pipelines were not being logged
- b719456: Skip variables without `p:value`

## 1.1.6

### Patch Changes

- d1cbb01: Updated `rdf-ext` and `@rdfjs/namespace` to v2

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
