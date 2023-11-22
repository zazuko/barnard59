---
"barnard59-cube": major
"barnard59-rdf": major
---

Move cube operations from package `barnard59-rdf` to the new package `barnard59-cube`.


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
