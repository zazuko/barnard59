# barnard59-sparql

SPARQL support for Barnard59 Linked Data pipelines.
This package exports operations to run SPARQL queries on endpoints that support the [SPARQL Protocol](https://www.w3.org/TR/sparql11-protocol/).

## Operations

### construct

Runs a construct or describe query and parses the response into RDF/JS Quad stream.

- `endpoint`: URL of the SPARQL endpoint as a string.
- `query`: The SPARQL construct or describe query as a string.
- `user`: User for basic authentication.
- `password`: Password for basic authentication.
- `operation`: The HTTP operation to use ('get' | 'postUrlencoded' | 'postDirect').

### select

Runs a select query and returns each row of the results as single chunk object.
The chunk object contains key-value pairs for each variable of the select query. 

- `endpoint`: URL of the SPARQL endpoint as a string.
- `query`: The SPARQL select query as a string.
- `user`: User for basic authentication.
- `password`: Password for basic authentication.
- `operation`: The HTTP operation to use ('get' | 'postUrlencoded' | 'postDirect').
