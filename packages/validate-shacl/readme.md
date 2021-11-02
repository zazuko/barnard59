#  barnard59-validate-shacl

A barnard59 step that validates RDF using the [Shapes Constraint Language](https://www.w3.org/TR/shacl) (SHACL).

## Install

```
npm install barnard59-validate-shacl --save
```

## Exported steps

### `validate`

A step that automates the validation of RDF against a set of conditions specified in a SHACL document. Note that this operation does not take care of partitioning the data, using this operation requires to prepare the data accordingly. 

| Argument   |      Type      |  Description |
|----------|:-------------:|------:|
| shacl |  string | Local path or URL of the shapes to load |
| shaclStream |  RDF/JS Dataset stream | a shape stream |

### Example: Validating using a SHACL from a raw string

```turtle
@prefix p: <https://pipeline.described.at/> .
@prefix code: <https://code.described.at/> .

<validateAddress> a p:Step;
           code:implementedBy [ a code:EcmaScriptModule;
                                code:link <node:barnard59-validate-schacl/validate.js#validate>
                              ];
           code:arguments [ code:name  "shacl" ;
                            code:value "address-shape.ttl" ] .
```
