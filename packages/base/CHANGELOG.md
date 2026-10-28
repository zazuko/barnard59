# barnard59-base

## 3.0.1

### Patch Changes

- [#408](https://github.com/zazuko/barnard59/pull/408) [`2359425`](https://github.com/zazuko/barnard59/commit/23594250599bbde63503ae8c0895405df669c922) Thanks [@tpluscode](https://github.com/tpluscode)! - Set the required node version to `>=16.18` in `engines`

## 3.0.0

### Major Changes

- [#399](https://github.com/zazuko/barnard59/pull/399) [`e5b0100`](https://github.com/zazuko/barnard59/commit/e5b01008eefe180859da3dc940fdb1b90a866abe) Thanks [@tpluscode](https://github.com/tpluscode)! - Removed `readable-stream` and replaced all usages with `node:stream`

### Patch Changes

- [#398](https://github.com/zazuko/barnard59/pull/398) [`6a7c8af`](https://github.com/zazuko/barnard59/commit/6a7c8afbbc5889c581db05d1654e38f75e914218) Thanks [@tpluscode](https://github.com/tpluscode)! - Updated `glob` to v13

## 2.5.2

### Patch Changes

- 8a6c1ae: Updated OpenTelemetry packages

## 2.5.1

### Patch Changes

- 2e75bf3: Updated `@aws-sdk/client-s3`
- bda7bf9: build(deps): bump glob from 10.3.10 to 10.5.0

## 2.5.0

### Minor Changes

- 65983ad: Adds a variadic parameter to `map` and` filter` steps, which will be forwarded to their respecitve callback functions called for each chunk

## 2.4.2

### Patch Changes

- f6d593c: `limit` step would not break the pipeline when the stream produces a very large or infinite stream

## 2.4.1

### Patch Changes

- d48f198: Update [glob](https://npm.im/glob) to v10
- 94551a4: Missing type declarations for `batch.js` and `Readable.js`

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
