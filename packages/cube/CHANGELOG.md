# barnard59-cube

## 1.4.8

### Patch Changes

- Updated dependencies [01682f7]
  - barnard59-formats@4.0.0
  - barnard59-shacl@1.4.9

## 1.4.7

### Patch Changes

- Updated dependencies [8282b0e]
- Updated dependencies [8282b0e]
  - barnard59-formats@3.0.0
  - barnard59-shacl@1.4.7

## 1.4.6

### Patch Changes

- 08d880c: Preferably create a single `sh:in` when building a cube shape

## 1.4.5

### Patch Changes

- 8f08421: Accept custom functions to create cube IRI and shape IRI
- Updated dependencies [cd81cc1]
- Updated dependencies [6fea1cc]
- Updated dependencies [1df0b79]
  - barnard59-formats@2.1.2

## 1.4.4

### Patch Changes

- a292c2e: Updated `rdf-validate-shacl` to v0.5.5
- Updated dependencies [f1caca5]
- Updated dependencies [a292c2e]
- Updated dependencies [57bb930]
  - barnard59-shacl@1.4.6
  - barnard59-formats@2.1.1

## 1.4.3

### Patch Changes

- 13a297f: Include a sample observation in fetch-metadata

## 1.4.2

### Patch Changes

- 600eb0e: Updated `rdf-validate-shacl` to v0.5.4
- Updated dependencies [f240b0f]
- Updated dependencies [600eb0e]
- Updated dependencies [f6d593c]
- Updated dependencies [f240b0f]
- Updated dependencies [49dcd13]
  - barnard59-sparql@2.3.0
  - barnard59-shacl@1.4.4
  - barnard59-base@2.4.2

## 1.4.1

### Patch Changes

- 2d61960: Fix batch size in check-observations
- 8ae9c7e: Include `cube:Constraint` when calling `b59 cube fetch-cube`
- e7f32d5: Updated dependency to avoid Windows errors in temp files cleanup
- Updated dependencies [052b1a5]
- Updated dependencies [e2705c8]
  - barnard59-shacl@1.4.2
  - barnard59-sparql@2.2.0

## 1.4.0

### Minor Changes

- 37b5b19: Additional commands: `fetch-cube`, `fetch-constraint`

### Patch Changes

- Updated dependencies [452d885]
  - barnard59-shacl@1.4.0

## 1.3.0

### Minor Changes

- f2e796c: Shape creation refactoring and improvements

### Patch Changes

- 7456a6a: added batch operation
- Updated dependencies [82dbe7e]
- Updated dependencies [c090ff2]
- Updated dependencies [7456a6a]
  - barnard59-rdf@3.4.0
  - barnard59-shacl@1.3.1
  - barnard59-base@2.4.0

## 1.2.0

### Minor Changes

- f883060: When fetching shapes, `code:imports` declarations are resolved and merged with the graph

### Patch Changes

- Updated dependencies [f883060]
- Updated dependencies [f883060]
- Updated dependencies [898c80f]
- Updated dependencies [f883060]
- Updated dependencies [898c80f]
- Updated dependencies [1bfec3c]
  - barnard59-shacl@1.2.0
  - barnard59-rdf@3.3.0

## 1.1.1

### Patch Changes

- 5c14dc9: Add parameter to override the format of the shapes graph
- Updated dependencies [5c14dc9]
- Updated dependencies [5c14dc9]
  - barnard59-rdf@3.2.2
  - barnard59-shacl@1.1.3

## 1.1.0

### Minor Changes

- b833a62: Support SHACL profile for validating cube to be loaded from local path

### Patch Changes

- e5a3457: The loaded profile can now be in any RDF serialzation
- Updated dependencies [c80f82b]
- Updated dependencies [b833a62]
  - barnard59-shacl@1.1.1
  - barnard59-rdf@3.2.0

## 1.0.1

### Patch Changes

- 1b09c57: Renamed fetch-constraint and check-constraint to fetch-metadata and check-metadata
- Updated dependencies [e0b6f85]
- Updated dependencies [d5249ee]
- Updated dependencies [0431adf]
  - barnard59-base@2.2.0
  - barnard59-shacl@1.1.0
  - barnard59-rdf@3.1.0

## 1.0.0

### Major Changes

- 68c034a: Move cube operations from package `barnard59-rdf` to the new package `barnard59-cube`.

  ```diff
  <#toObservation> a p:Step;
    code:implementedBy [ a code:EcmaScriptModule;
      - code:link <node:barnard59-rdf/cube.js#toObservation>
      + code:link <node:barnard59-cube/cube.js#toObservation>
    ].

  <#buildCubeShape> a p:Step;
    code:implementedBy [ a code:EcmaScriptModule;
      - code:link <node:barnard59-rdf/cube.js#buildCubeShape>
      + code:link <node:barnard59-code/cube.js#buildCubeShape>
    ].

  ```

### Patch Changes

- Updated dependencies [bb3b99b]
- Updated dependencies [68c034a]
  - barnard59-sparql@2.1.1
  - barnard59-rdf@3.0.0
