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

### put ({ endpoint, graph, user, password, allowEmpty, allowClear })

This operation replaces the selected graph in the SPARQL Graph Store.
A `Writable` stream of RDF/JS `Quad` objects is returned.
The following options are supported:

- `endpoint`: The URL of the graph store endpoint as a string.
- `graph`: The target graph IRI or RDF/JS named node. Use the string `DEFAULT` for the default graph.
- `allowEmpty`: Defaults to `false`, so input with no quads fails. Set to `true` to warn and skip the upload successfully.
- `allowClear`: Defaults to `false`. Set to `true` to clear the target graph with an empty PUT when the input contains no quads. This takes precedence over `allowEmpty`.
- `user`: User for basic authentication.
- `password`: Password for basic authentication.

The `barnard59 graph-store put` command takes a file glob in `--source` and requires `--graph`. If the source contains no RDF quads, the command fails by default. Pass `--allow-empty` to warn, skip the upload, and exit successfully. Pass `--allow-clear` to clear the target graph with an empty PUT, including when the glob matches no files. If both flags are supplied, the graph is cleared on empty input. Password values are masked in pipeline logs.

## Examples

See the [barnard59-examples](https://github.com/zazuko/barnard59-examples/) repository for working example pipelines. 
