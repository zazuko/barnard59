# barnard59-cube

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
