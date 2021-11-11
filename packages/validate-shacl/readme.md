#  barnard59-validate-shacl

A barnard59 step that validates RDF using the [Shapes Constraint Language](https://www.w3.org/TR/shacl) (SHACL).

## Install

```
npm install barnard59-validate-shacl --save
```

## Exported steps

### `validate`

A step that automates the validation of RDF against a set of conditions specified in a SHACL document. Note that this operation does not take care of partitioning the data, using this operation requires to prepare the data accordingly. 

The argument can be a RDF stream or the URL pointing to the SHACL shapes. 

### Example: Validating using a SHACL from a file

```turtle
@prefix p: <https://pipeline.described.at/> .
@prefix code: <https://code.described.at/> .

<validateAddress> a p:Step;
           code:implementedBy [ a code:EcmaScriptModule;
                                code:link <node:barnard59-validate-schacl/validate.js#validate>
                              ];
           code:arguments ("address-shape.ttl" ) .
```
