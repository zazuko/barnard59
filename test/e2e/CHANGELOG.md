# barnard59-test-e2e

## 0.1.2

### Patch Changes

- Updated dependencies [8282b0e]
- Updated dependencies [8282b0e]
  - barnard59-formats@3.0.0

## 0.1.1

### Patch Changes

- Updated dependencies [d48f198]
- Updated dependencies [3caf9e4]
- Updated dependencies [d48f198]
- Updated dependencies [94551a4]
  - barnard59-core@6.0.0
  - barnard59-base@2.4.1

## 0.1.0

### Minor Changes

- 32fa9c7: Make the e2e tests reflect real CLI usage more closely by setting `basePath` to be the actual pipeline path

### Patch Changes

- Updated dependencies [86131dc]
- Updated dependencies [ba328de]
- Updated dependencies [0c0245d]
- Updated dependencies [70b50da]
- Updated dependencies [464b09e]
- Updated dependencies [ba328de]
- Updated dependencies [a172b45]
- Updated dependencies [86131dc]
  - barnard59-env@1.2.1
  - barnard59-core@5.3.0
  - barnard59-base@2.3.0

## 0.0.5

### Patch Changes

- 898c80f: Use `barnard59-env` instead of `@zazuko/env(-node)`.

  Remove direct dependency on `@rdfjs/formats-common`

- 5a70d2b: Updated `rdf-loader-code`
- Updated dependencies [5a70d2b]
- Updated dependencies [5a70d2b]
- Updated dependencies [5a70d2b]
- Updated dependencies [5a70d2b]
- Updated dependencies [1bfec3c]
- Updated dependencies [5a70d2b]
  - barnard59-env@1.2.0
  - barnard59-core@5.2.0

## 0.0.4

### Patch Changes

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

- Updated dependencies [ce0bdf4]
- Updated dependencies [67504df]
- Updated dependencies [ce0bdf4]
- Updated dependencies [ce0bdf4]
  - barnard59-core@5.0.0
  - barnard59-base@2.0.1
  - barnard59-env@1.0.0
  - barnard59-formats@2.1.0
  - barnard59-test-support@0.0.3

## 0.0.3

### Patch Changes

- 6be7cd8: Literals loaded as step arguments will be converted to matching JS type (closes #116)
- 72648c5: Change the operation URLs to be HTTPS (re zazuko/barnard59-website#4).
  This will only be a breaking change to those using the [shorthand step syntax](https://data-centric.zazuko.com/docs/workflows/explanations/simplified-syntax).
- Updated dependencies [64b50ac]
- Updated dependencies [6be7cd8]
- Updated dependencies [72648c5]
  - barnard59-base@2.0.0
  - barnard59-core@4.0.0
  - barnard59-formats@2.0.0
  - barnard59-http@2.0.0
  - barnard59-test-support@0.0.2

## 0.0.2

### Patch Changes

- Updated dependencies [028126d]
  - barnard59-core@3.0.0

## 0.0.1

### Patch Changes

- b5e23e2: Update clownface to `v2`, use `@zazuko/env` instead of `rdf-ext`
- Updated dependencies [b5e23e2]
- Updated dependencies [22f897d]
  - barnard59-core@2.1.0
  - barnard59-test-support@0.0.1
