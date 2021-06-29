# barnard59-graph-store

[SPARQL Graph Store Protocol](https://www.w3.org/TR/sparql11-http-rdf-update/) support for Linked Data pipelines.

This package provides operations to read and write from a SPARQL Graph Store.

## Operations

The operation names match the HTTP methods in lower case.

### get ({ endpoint, graph, user, password })

This operation reads a named graph from the given SPARQL Graph Store.
A `Readable` stream of RDF/JS `Quad` objects is returned.
The following options are supported:

- `endpoint`: The URL of the Graph Store endpoint as a string.
- `graph`: The named graph which should be read as a string or RDF/JS Term.
  The default graph will be read if an empty string is given or the option is not given at all.
- `user`: User for basic authentication.
- `password`: Password for basic authentication.

### post ({ endpoint, user, password, maxQuadsPerRequest })

This operation appends quads to the given SPARQL Graph store.
A `Writable` stream of RDF/JS `Quad` objects is returned.
The following options are supported:

- `endpoint`: The URL of the graph store endpoint as a string.
- `user`: User for basic authentication.
- `password`: Password for basic authentication.
- `maxQuadsPerRequest`: The maximum number of quads per request until a new request is made.
  (default: 500000)

### put ({ endpoint, user, password, maxQuadsPerRequest })

This operation appends quads to the given SPARQL Graph store.
A `Writable` stream of RDF/JS `Quad` objects is returned.
The following options are supported:

- `endpoint`: The URL of the graph store endpoint as a string.
- `user`: User for basic authentication.
- `password`: Password for basic authentication.
- `maxQuadsPerRequest`: The maximum number of quads per request until a new request is made.
  (default: 500000)

## Examples

See the [barnard59-examples](https://github.com/zazuko/barnard59-examples/) repository for working example pipelines. 
