# barnard59-http

## 3.0.0

### Major Changes

- [#399](https://github.com/zazuko/barnard59/pull/399) [`e5b0100`](https://github.com/zazuko/barnard59/commit/e5b01008eefe180859da3dc940fdb1b90a866abe) Thanks [@tpluscode](https://github.com/tpluscode)! - Removed `readable-stream` and replaced all usages with `node:stream`

## 2.1.1

### Patch Changes

- 8a6c1ae: Updated OpenTelemetry packages

## 2.1.0

### Minor Changes

- f4c4fc6: Add overload to `get` and `post` to match the signature of native `fetch`

### Patch Changes

- cb4223b: Added TS declarations

## 2.0.0

### Major Changes

- 6be7cd8: Literals loaded as step arguments will be converted to matching JS type (closes #116)
- 72648c5: Change the operation URLs to be HTTPS (re zazuko/barnard59-website#4).
  This will only be a breaking change to those using the [shorthand step syntax](https://data-centric.zazuko.com/docs/workflows/explanations/simplified-syntax).

## 1.1.1

### Patch Changes

- f0814d5: Operations in manifest had wrong types
- 295db4c: Updated `node-fetch` to v3 and allow `readable-stream` v4

- Moved to JavaScript modules
