#  barnard59-validate-shacl

A barnard59 step that validates RDF using the [Shapes Constraint Language](https://www.w3.org/TR/shacl) (SHACL).

## Install

```
npm install barnard59-validate-shacl --save
```

## Exported steps

### `validate`

Validates a chunk of RDF against a set of conditions specified in a SHACL graph.

The argument is a RDF stream containing the SHACL shapes.

```turtle
prefix : <https://pipeline.described.at/>
prefix code: <https://code.described.at/>

<#shaclValidate> a :Step ;
  code:implementedBy
    [
      a code:EcmaScriptModule ;
      code:link <node:barnard59-validate-shacl/validate.js#shacl>
    ] ;
  code:arguments ( <#CubeShapes> ) ;
.
```

> Note that this operation does not take care of partitioning the data, using this operation requires to prepare the data accordingly.

To pass additional options, initialize the step with named arguments instead. All except `shape` are optional.

```turtle
prefix : <https://pipeline.described.at/>
prefix code: <https://code.described.at/>

<#shaclValidate> a :Step ;
  code:implementedBy
    [
      a code:EcmaScriptModule ;
      code:link <node:barnard59-validate-shacl/validate.js#shacl>
    ] ;
  code:arguments
    [ code:name "shape" ; code:value <#CubeShapes> ] ,
    # validation will stop when the given number is reached (default 1)
    [ code:name "maxErrors" ; code:value 100 ] ;
.
```
