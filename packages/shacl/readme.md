#  barnard59-shacl

A barnard59 step that validates RDF using the [Shapes Constraint Language](https://www.w3.org/TR/shacl) (SHACL).

## Install

```
npm install barnard59-shacl --save
```

‼️ This package was previously published as `barnard59-validate-shacl`. Please update your dependencies accordingly. ‼️

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
      code:link <node:barnard59-shacl/validate.js#shacl>
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
      code:link <node:barnard59-shacl/validate.js#shacl>
    ] ;
  code:arguments
    [ code:name "shape" ; code:value <#CubeShapes> ] ,
    # validation will stop when the given number is reached (default 1)
    # set to 0 to report all errors    
    [ code:name "maxErrors" ; code:value 100 ] ,
    # callback function which allows pipeline authors to perform
    # additional actions and/or decide to continue the pipeline 
    # when SHACL violations are encountered (see below)
    [ 
      code:name "onViolation" ; 
      code:value [ a code:EcmaScriptModule ; code:link <file:...> ] ;
    ] ;
.
```

#### `onViolation`

The function below could be used to continue the pipeline when SHACL violations are found but none of them are `sh:Violation`.

```js
import { sh } from '@tpluscode/rdf-ns-builders'

/**
* @param context {Object} Pipeline context
* @param data {DatasetCore} Data graph which failed validation
* @param report {ValidationReport}
*/
export function continueOnWarnings({ context, data, report }) {
    const hasViolations = report.results.some(({ severity }) => severity.equals(sh.Violation))

    return !hasViolations
}
```
