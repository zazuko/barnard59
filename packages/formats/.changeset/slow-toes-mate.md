---
"barnard59-formats": minor
---

Forward n3 step options to parser (closes #24). For example, to parse n3 rules 

```turtle
[
  a :Step ;
  code:implementedBy
    [
      a code:EcmaScriptModule ;
      code:link <node:barnard59-formats/n3.js#parse>
    ] ;
  code:arguments
    [
      code:name "format" ;
      code:value "text/n3" ;
    ] ;
]
```
