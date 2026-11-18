---
name: barnard59-graph-store
description: Use when reading, appending to, or replacing RDF graphs through the SPARQL Graph Store Protocol in Barnard59.
---

# SPARQL Graph Store

With `@prefix op: <https://barnard59.zazuko.com/operations/> .`, use predicates such as `op:graph-store\/get`. All three steps accept named `endpoint` and optional `user` and `password`. Use the Graph Store URL. For a query endpoint and a SPARQL query, use `barnard59-sparql`.

## Pipeline steps

### `get`

`<node:barnard59-graph-store/get.js#default>` is a source that emits one RDF/JS quad per object-mode chunk. Pass `graph` as an IRI string or RDF/JS named node. Omit it, pass an empty string, or supply an RDF/JS default-graph term to read the default graph. Feed the output directly into a quad transform, group it into datasets, or serialize it for a byte sink.

### `post`

`<node:barnard59-graph-store/post.js#default>` consumes individual RDF/JS quads and appends them to the selected graph. Supply `graph` explicitly as a named graph or use the string `DEFAULT` for the default graph. Flatten upstream datasets or quad arrays before this sink. Choose `post` when RDF already present in the target should be retained.

### `put`

`<node:barnard59-graph-store/put.js#default>` consumes individual RDF/JS quads and replaces the selected graph's contents. Supply an explicit `graph`, using `DEFAULT` for the default graph. Choose `put` for a complete replacement and make sure upstream produces the full desired graph.

## CLI commands

### `graph-store put`

The CLI command reads local RDF documents selected by a glob, parses them by extension, and writes the resulting quads to the target graph. Quote the pattern so the CLI receives it as one argument. Supply `--graph` explicitly. The command fails if the source contains no RDF quads. Use `--allow-empty` to warn, skip the upload, and exit successfully.

```sh
barnard59 graph-store put --source 'data/*.ttl' --graph https://example.org/graph --endpoint https://example.org/store
```
