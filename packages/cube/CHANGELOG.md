# barnard59-cube

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
