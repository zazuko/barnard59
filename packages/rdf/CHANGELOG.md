# barnard59-rdf

## 3.4.0

### Minor Changes

- 82dbe7e: Bundle TypeScript type declarations

### Patch Changes

- Updated dependencies [c090ff2]
- Updated dependencies [82dbe7e]
  - barnard59-env@1.2.2

## 3.3.0

### Minor Changes

- f883060: `rdf:open` will parse local resource taking the file's path as `file:` base URI
- f883060: Added operation `rdf:transformCodeImports`. See [rdf-transform-code-imports package](https://github.com/zazuko/rdf-transform-graph-imports) for details.

### Patch Changes

- 898c80f: Use `barnard59-env` instead of `@zazuko/env(-node)`.

  Remove direct dependency on `@rdfjs/formats-common`

- 898c80f: Remove dependency on `rdf-utils-fs` and use it via `barnard59-env`
- 1bfec3c: `rdf:open` would not apply resource URL as base when parsing
- Updated dependencies [5a70d2b]
- Updated dependencies [5a70d2b]
  - barnard59-env@1.2.0

## 3.2.2

### Patch Changes

- 5c14dc9: Add the option to override the media type of remote resources when using `rdf:open` operation

## 3.2.1

### Patch Changes

- c759278: Wrong code type in manifest of `<open>` operation
- ebe9128: fix manifest entry for splitDataset (bySubject and byType)

## 3.2.0

### Minor Changes

- b833a62: Added a universal RDF open step which fetches from the web or local path

  ```turtle
  @prefix rdf: <https://barnard59.zazuko.com/operations/rdf/> .

  [ rdf:open ( "path/to/shapes" ) ] .
  ```

## 3.1.0

### Minor Changes

- 0431adf: Export `rdf-stream-to-dataset-stream` functions as pipeline operations.

  - `<https://barnard59.zazuko.com/operations/rdf/getDataset>`
  - `<https://barnard59.zazuko.com/operations/rdf/splitDataset/byGraph>`
  - `<https://barnard59.zazuko.com/operations/rdf/splitDataset/byPredicate>`
  - `<https://barnard59.zazuko.com/operations/rdf/splitDataset/bySubject>`
  - `<https://barnard59.zazuko.com/operations/rdf/splitDataset/byType>`

## 3.0.0

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
      + code:link <node:barnard59-cube/cube.js#buildCubeShape>
    ].

  ```

## 2.0.0

### Major Changes

- 6be7cd8: Literals loaded as step arguments will be converted to matching JS type (closes #116)
- 72648c5: Change the operation URLs to be HTTPS (re zazuko/barnard59-website#4).
  This will only be a breaking change to those using the [shorthand step syntax](https://data-centric.zazuko.com/docs/workflows/explanations/simplified-syntax).

## 1.4.5

### Patch Changes

- 4e0fffc: `cube.js#toCubeShape`: add argument propertyShapeId which creates dimension Property Shape identifiers
- 8302dc1: Remove direct usages of clownface

## 1.4.4

### Patch Changes

- 0c07f01: Updated `rdf-transform-triple-to-quad` to v2

## 1.4.3

### Patch Changes

- f0814d5: Operations in manifest had wrong types

## 1.4.2

### Patch Changes

- b5e23e2: Update clownface to `v2`, use `@zazuko/env` instead of `rdf-ext`

## 1.4.1

### Patch Changes

- ddd091c: Fixes "Callback called multiple times" when parsing

## 1.4.0

### Minor Changes

- 205d0df: Added a simplified step for loading RDF documents from filesystem

### Patch Changes

- b67047a: Add missing dependency on `is-stream` which was added as dev dependency

- Moved to JavaScript modules
