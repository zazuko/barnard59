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

The argument is an RDF stream containing the SHACL shapes.

```turtle
prefix : <https://pipeline.described.at/>
prefix op: <https://barnard59.zazuko.com/operations/>

<#Validate> a :Pipeline, :Readable ;
  :steps [ :stepList (
    [ op:rdf\/open ("data.ttl") ]
    [ op:rdf\/getDataset () ]
    [ op:shacl\/validate (<#CubeShapes>) ]
    [ op:base\/flatten () ]
    [ op:formats\/ntriples\/serialize () ]
  ) ] .

<#CubeShapes> a :Pipeline, :ReadableObjectMode ;
  :steps [ :stepList (
    [ op:rdf\/open ("shapes.ttl") ]
  ) ] .
```

The example groups all input quads into one dataset. For separate validation units, group quads into one dataset per unit before the validation step.

To pass additional options, initialize the step with named arguments instead. All except `shape` are optional.

```turtle
prefix : <https://pipeline.described.at/>
prefix code: <https://code.described.at/>
prefix shacl: <https://barnard59.zazuko.com/operations/shacl/>

[ shacl:validate
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
    ] 
].
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


### `report`

Similar to `validate`, but instead of returning the data graph, it streams SHACL validation report(s).

```turtle
prefix : <https://pipeline.described.at/>
prefix op: <https://barnard59.zazuko.com/operations/>

<#Report> a :Pipeline, :Readable ;
  :steps [ :stepList (
    [ op:rdf\/open ("data.ttl") ]
    [ op:rdf\/getDataset () ]
    [ op:shacl\/report (<#CubeShapes>) ]
    [ op:base\/flatten () ]
    [ op:formats\/ntriples\/serialize () ]
  ) ] .

<#CubeShapes> a :Pipeline, :ReadableObjectMode ;
  :steps [ :stepList (
    [ op:rdf\/open ("shapes.ttl") ]
  ) ] .
```



Pass `maxErrors` to set a threshold for accumulated `sh:Violation` results. The operation checks the threshold before the next dataset. Omit it or set it to `0` to process all datasets.

```turtle
[
  shacl:report
    [ code:name "shape" ; code:value <#CubeShapes> ] ,
    [ code:name "maxErrors" ; code:value 0 ]
] .
```


## Commands

Peer dependencies must be explicitly installed

```
npm i barnard59-base barnard59-formats barnard59-rdf
```

### validate

Reads standard input and validates the data against the given SHACL shapes.

```bash
cat data.ttl | barnard59 shacl validate --shapes https://example.com/shapes.ttl
```

Shapes can also be path relative to the working directory.

If a remote shapes response has a missing or incorrect Content-Type header, use `--shapesMediaType` to select an RDF parser. Pass a media type such as `text/turtle`.

### report-summary

Creates a human-readable summary of the machine-readable [standard](https://www.w3.org/TR/shacl/#validation-report) output of the validation pipeline. 
```bash
cat data.ttl \
| barnard59 shacl validate --shapes https://example.com/shapes.ttl \
| barnard59 shacl report-summary
```
