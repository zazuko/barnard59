# barnard59-shacl

## 1.4.4

### Patch Changes

- 600eb0e: Updated `rdf-validate-shacl` to v0.5.4
- 49dcd13: Update `@rdfjs/to-ntriples` to v3
- Updated dependencies [f6d593c]
  - barnard59-base@2.4.2

## 1.4.3

### Patch Changes

- d48f198: Remove usage of `rdf-js` package (deprecated)
- f8e7504: Fix sh:conforms in case of results with any severity
- Updated dependencies [d48f198]
- Updated dependencies [94551a4]
  - barnard59-base@2.4.1

## 1.4.2

### Patch Changes

- 052b1a5: Produce SHACL report on successful validation

## 1.4.1

### Patch Changes

- e82aa36: Remove references of `rdf-js` types package, repaced with `@rdfjs/types`

## 1.4.0

### Minor Changes

- 452d885: Added `report-summary` command

## 1.3.1

### Patch Changes

- c090ff2: Updated `rdf-validate-shacl`
- Updated dependencies [82dbe7e]
- Updated dependencies [7456a6a]
  - barnard59-rdf@3.4.0
  - barnard59-base@2.4.0

## 1.3.0

### Minor Changes

- cf2f15c: Bundle TypeScript type declarations

### Patch Changes

- Updated dependencies [0c0245d]
- Updated dependencies [464b09e]
- Updated dependencies [ba328de]
  - barnard59-base@2.3.0

## 1.2.0

### Minor Changes

- f883060: When fetching shapes, `code:imports` declarations are resolved and merged with the graph

### Patch Changes

- Updated dependencies [f883060]
- Updated dependencies [898c80f]
- Updated dependencies [f883060]
- Updated dependencies [898c80f]
- Updated dependencies [1bfec3c]
  - barnard59-rdf@3.3.0

## 1.1.3

### Patch Changes

- 5c14dc9: Add parameter to override the format of the shapes graph
- Updated dependencies [5c14dc9]
  - barnard59-rdf@3.2.2

## 1.1.2

### Patch Changes

- ebe9128: prevent potential memory leaks by creating a fresh validator for each chunk
- Updated dependencies [c759278]
- Updated dependencies [ebe9128]
  - barnard59-rdf@3.2.1

## 1.1.1

### Patch Changes

- c80f82b: Resolve shapes against working directory
- Updated dependencies [b833a62]
  - barnard59-rdf@3.2.0

## 1.1.0

### Minor Changes

- d5249ee: Added a pipeline command which validates quads from standard input

### Patch Changes

- Updated dependencies [e0b6f85]
- Updated dependencies [0431adf]
  - barnard59-base@2.2.0
  - barnard59-rdf@3.1.0

## 1.0.0

### Major Changes

- 430ce8a: Update manifest: current namespace and use HTTPS URL
- Renamed from `barnard59-validate-shacl` to `barnard59-shacl`

### Minor Changes

- 430ce8a: Update `rdf-validate-shacl` to v0.5
- 430ce8a: Remove dependency on `@zazuko/env` and use environment provided at runtime.

- First version
