# barnard59-graph-store

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
