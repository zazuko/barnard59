# barnard59-graph-store

## 6.0.4

### Patch Changes

- 713def9: Remove mention of unused `maxQuadsPerRequest` option from the readme

## 6.0.3

### Patch Changes

- 4de8909: Update `rdf-literal` to v2
- Updated dependencies [4de8909]
  - barnard59-rdf@3.4.1

## 6.0.2

### Patch Changes

- 9cad30b: Updated onetime to v7

## 6.0.1

### Patch Changes

- 83583d2: Type annotations: remove references to `rdf-js`, using `@rdfjs/types` instead

## 6.0.0

### Major Changes

- f240b0f: Updated `sparql-http-client` to v3
  Removed `maxQuadsPerRequest` from PUT and POST operations

### Patch Changes

- Updated dependencies [f6d593c]
  - barnard59-base@2.4.2

## 5.1.2

### Patch Changes

- d48f198: Remove usage of `rdf-js` package (deprecated)
- Updated dependencies [d48f198]
- Updated dependencies [94551a4]
  - barnard59-base@2.4.1

## 5.1.1

### Patch Changes

- e82aa36: Remove references of `rdf-js` types package, repaced with `@rdfjs/types`

## 5.1.0

### Minor Changes

- 4d7b620: Bundle TypeScript declarations

### Patch Changes

- Updated dependencies [0c0245d]
- Updated dependencies [464b09e]
- Updated dependencies [ba328de]
  - barnard59-base@2.3.0

## 5.0.0

### Major Changes

- ade9d1f: Disable stream splitting by default, add optional argument to `put` pipeline
- b82b47b: Align operation URIs with the other packages

  ```diff
  -prefix graph-store: <https://barnard59.zazuko.com/operation/graph-store/>
  +prefix graph-store: <https://barnard59.zazuko.com/operations/graph-store/>
  ```

## 4.0.0

### Patch Changes

- Updated dependencies [68c034a]
  - barnard59-rdf@3.0.0

## 3.0.0

### Patch Changes

- Updated dependencies [5327ff0]
  - barnard59-base@2.1.0

## 2.1.0

### Minor Changes

- ce0bdf4: Removed dependency on any RDF/JS Environment. The CLI provides it at runtime to ensure that steps
  use the same factories. Step implementors are encouraged to use the environment provided by the
  barnard59 runtime insead of importing directly.

  ```diff
  -import rdf from 'rdf-ext'

  export function myStep() {
  - const dataset = rdf.dataset()
  + const dataset = this.env.dataset()

    return rdf.dataset().toStream()
  }
  ```

### Patch Changes

- Updated dependencies [67504df]
  - barnard59-base@2.0.1

## 2.0.0

### Major Changes

- 6be7cd8: Literals loaded as step arguments will be converted to matching JS type (closes #116)
- 72648c5: Change the operation URLs to be HTTPS (re zazuko/barnard59-website#4).
  This will only be a breaking change to those using the [shorthand step syntax](https://data-centric.zazuko.com/docs/workflows/explanations/simplified-syntax).

### Patch Changes

- Updated dependencies [64b50ac]
- Updated dependencies [6be7cd8]
- Updated dependencies [72648c5]
  - barnard59-base@2.0.0
  - barnard59-rdf@2.0.0

## 1.1.1

### Patch Changes

- f0814d5: Operations in manifest had wrong types
- Updated dependencies [f0814d5]
  - barnard59-base@1.2.2
  - barnard59-rdf@1.4.3

## 1.1.0

### Minor Changes

- 03fd12a: Added a reusable `put` pipeline

## 1.0.2

### Patch Changes

- fd2353f: Updated `@rdfjs/data-model` to v2

- Moved to JavaScript modules
