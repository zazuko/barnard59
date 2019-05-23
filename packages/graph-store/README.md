# barnard59-graph-store

[SPARQL Graph Store Protocol](https://www.w3.org/TR/sparql11-http-rdf-update/) support for Linked Data pipelines.

## Operations

The package provides operations matching the HTTP methods in lower case letters.
`PUT` and `POST` automatically handle different graphs from the RDF/JS Quad Stream.
Whenever the graph of the quad changes, the operation will make a new request.
Only media type `application/n-triples` is used for sending and receiving data.

### put

Makes one or more HTTP PUT requests based on the incoming RDF/JS Quad Stream.

Options:
- endpoint: The URL of the SPARQL Update Endpoint as a string.
