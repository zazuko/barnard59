# barnard59-base

## 2.4.0

### Minor Changes

- 7456a6a: added batch operation

## 2.3.0

### Minor Changes

- 0c0245d: Bundle TypeScript type declarations
- 464b09e: Added an operation which creates a readable from given values (closes #199)

### Patch Changes

- ba328de: Simplify `base:limit` and `base:offset` by using async generators

## 2.2.0

### Minor Changes

- e0b6f85: Added an operation to read standard input

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
