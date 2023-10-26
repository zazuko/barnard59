# v1.0.0

## 2.0.0

### Major Changes

- 6be7cd8: Literals loaded as step arguments will be converted to matching JS type (closes #116)
- 72648c5: Change the operation URLs to be HTTPS (re zazuko/barnard59-website#4).
  This will only be a breaking change to those using the [shorthand step syntax](https://data-centric.zazuko.com/docs/workflows/explanations/simplified-syntax).

## 1.4.5

### Patch Changes

- 4e0fffc: `cube.js#toCubeShape`: add argument propertyShapeId which creates dimension Property Shape identifiers
- 8302dc1: Remove direct usages of clownface

## 1.4.4

### Patch Changes

- 0c07f01: Updated `rdf-transform-triple-to-quad` to v2

## 1.4.3

### Patch Changes

- f0814d5: Operations in manifest had wrong types

## 1.4.2

### Patch Changes

- b5e23e2: Update clownface to `v2`, use `@zazuko/env` instead of `rdf-ext`

## 1.4.1

### Patch Changes

- ddd091c: Fixes "Callback called multiple times" when parsing

## 1.4.0

### Minor Changes

- 205d0df: Added a simplified step for loading RDF documents from filesystem

### Patch Changes

- b67047a: Add missing dependency on `is-stream` which was added as dev dependency

- Moved to JavaScript modules
