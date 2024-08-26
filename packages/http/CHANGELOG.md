# barnard59-http

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
