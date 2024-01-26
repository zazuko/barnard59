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
prefix code: <https://code.described.at/>
prefix shacl: <https://barnard59.zazuko.com/operations/shacl/>
prefix fs: <https://barnard59.zazuko.com/operations/core/fs/>

[
  a :Pipeline ;
  :steps
    [
      :stepList 
        (
          [ fs:createReadStream ( "path/to/data" ) ]
          [ shacl:validate ( <#CubeShapes> ) ]
        )
    ] ;
] .
```

> Note that this operation does not take care of partitioning the data, using this operation requires to prepare the data accordingly.

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
prefix code: <https://code.described.at/>
prefix shacl: <https://barnard59.zazuko.com/operations/shacl/>
prefix fs: <https://barnard59.zazuko.com/operations/core/fs/>

[
  a :Pipeline, :Readable ;
  :steps
    [
      :stepList 
        (
          [ fs:createReadStream ( "path/to/data" ) ]
          # TODO: parse input and group into dataset chunks for validation
          [ shacl:report ( <#CubeShapes> ) ]
        )
    ] ;
] .
```



By default, the pipeline will stop when 500 validation errors are encountered across all processed datasets. This can be changed by passing a `maxErrors` argument. Specifically, to fail on first violation, set it to `0`. 

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

In cases when a remote address give to `--shapes` option does not include a correct `content-type` header (or does not provide a `content-type` header at all), the pipeline will fail. In such cases, it is possible to use the `--shapesFormat` option to select the correct RDF parser. Its value must be a media type, such as `text/turtle`.

### report-summary

Creates a human-readable summary of the machine-readable [standard](https://www.w3.org/TR/shacl/#validation-report) output of the validation pipeline. 
```bash
cat data.ttl \
| barnard59 shacl validate --shapes https://example.com/shapes.ttl \
| barnard59 shacl report-summary
```
