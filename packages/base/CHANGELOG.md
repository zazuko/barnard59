# v1.0.0

## 2.1.0

### Minor Changes

- 5327ff0: Filter: bind filter callback function to pipeline context

## 2.0.1

### Patch Changes

- 67504df: Remove redundant dependency on `rdf-utils-fs`

## 2.0.0

### Major Changes

- 6be7cd8: Literals loaded as step arguments will be converted to matching JS type (closes #116)
- 72648c5: Change the operation URLs to be HTTPS (re zazuko/barnard59-website#4).
  This will only be a breaking change to those using the [shorthand step syntax](https://data-centric.zazuko.com/docs/workflows/explanations/simplified-syntax).

### Minor Changes

- 64b50ac: glob: added a warning message when nothing was matched

## 1.2.2

### Patch Changes

- f0814d5: Operations in manifest had wrong types

## 1.2.1

### Patch Changes

- 4bbf8f2: Added missing dependency on `readable-to-readable`, and replaced `lodash/once.js` with `onetime` (also missing as dependency)

## 1.2.0

### Minor Changes

- 2c4af8f: Use [parallel-transform](https://npm.im/parallel-transform) to implement the map step (closes #10)

- Moved to JavaScript modules
