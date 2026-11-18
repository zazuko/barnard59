---
name: barnard59-sparql
description: Use when querying a remote SPARQL endpoint or running SPARQL queries and updates against in-memory datasets in Barnard59.
---

# SPARQL steps

With `@prefix op: <https://barnard59.zazuko.com/operations/> .`, use predicates such as `op:sparql\/construct`. Remote sources take named `endpoint` and `query`, with optional `user`, `password`, and `operation`. The transport values are `get`, `postUrlencoded`, and `postDirect`. To load query text from a separate file, use `[ code:name "query"; code:value "query.rq"^^p:FileContents ]`.

## `construct`

`<node:barnard59-sparql/construct.js#default>` sends a CONSTRUCT query to the endpoint and emits one RDF/JS quad per object-mode chunk. Send its result to a quad transform or serializer. Use a Graph Store source when you want the contents of a graph with no query.

## `select`

`<node:barnard59-sparql/select.js#default>` sends a SELECT query and emits one row of RDF/JS term bindings per object-mode chunk. Treat each row as a record. Use `barnard59-base`'s `map` to extract or transform bindings, then serialize the resulting records for a byte destination.

## `in-memory/query`

`<node:barnard59-sparql/inMemory.js#query>` takes SPARQL query text positionally. It builds a fresh Oxigraph store for each iterable of quads and queries it independently. The emitted chunk follows the query form, such as a boolean for ASK or an array of quads for CONSTRUCT. Group input quads first so all data needed by each query is in the same chunk.

## `in-memory/update`

`<node:barnard59-sparql/inMemory.js#update>` takes SPARQL Update text positionally. It builds a fresh store per iterable of quads, applies the update there, and emits an array containing the updated store's quads. The update is local to each chunk. Flatten the arrays before later steps that expect individual quads.
