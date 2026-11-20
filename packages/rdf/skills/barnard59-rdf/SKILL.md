---
name: barnard59-rdf
description: Use when opening, grouping, transforming, enriching, or combining RDF/JS quad and dataset streams in Barnard59.
---

# RDF stream operations

Declare `@prefix op: <https://barnard59.zazuko.com/operations/> .` and use shorthand such as `[ op:rdf\/open ("data.ttl") ]`. These steps operate on RDF/JS quads, path strings, or datasets as described below.

## `open`

`<node:barnard59-rdf/open.js#default>` takes a path or URL as its first positional argument and produces RDF/JS quads. Local paths are relative to the working directory and use the file extension for parser selection. For HTTP resources, the response media type normally selects the parser. Pass a media type such as `"text/turtle"` as the second positional argument to override it.

## `fs.js#parse`

`<node:barnard59-rdf/fs.js#parse>` takes no arguments and opens each path string it receives in object mode. It selects the parser by extension and emits the parsed quads in one stream. Connect it directly after `barnard59-base`'s `glob` when multiple RDF files should feed the same downstream operation. Add grouping separately if the downstream step needs datasets.

## `getDataset`

`<node:rdf-stream-to-dataset-stream/toDatasetStream.js>` takes no arguments. It accumulates all incoming quads and emits one dataset when a nonempty stream ends. Use it before a step that needs a complete graph, such as an in-memory query or SHACL validation. It holds the input in memory.

## `splitDataset/byGraph`

`<node:rdf-stream-to-dataset-stream/byGraph.js>` takes no arguments and starts a new dataset when the quad's graph changes. Keep quads for a graph consecutive if each graph should produce a single dataset. A graph that reappears later starts another dataset.

## `splitDataset/byPredicate`

`<node:rdf-stream-to-dataset-stream/byPredicate.js>` requires a predicate IRI or RDF/JS term as the first positional argument. It uses each quad with that predicate as a boundary, starting the next dataset with the matching quad when there is a preceding group. The specified predicate acts as a record marker. Choose this step when input order places the marker before the rest of the record.

For example, use `[ op:rdf\/splitDataset\/byPredicate ("https://example.org/recordStart") ]`.

## `splitDataset/bySubject`

`<node:rdf-stream-to-dataset-stream/bySubject.js>` takes no arguments. A change in named-node subject starts a new dataset. Blank-node subjects do not trigger a split. Keep their related quads adjacent to the appropriate named-node group. Sort or group input by subject before using this step when equal named subjects can recur later.

## `splitDataset/byType`

`<node:rdf-stream-to-dataset-stream/byType.js>` requires a class IRI or RDF/JS term as the first positional argument. A quad with predicate `rdf:type` and that class as its object marks the start of a new dataset. Put the matching type quad before the other quads for the resource. Other type assertions flow into the current group.

For example, use `[ op:rdf\/splitDataset\/byType ("https://example.org/Record") ]`.

All four split operations emit datasets. Use `barnard59-base`'s `flatten` to return to individual quads.

## `mapMatch`

`<node:barnard59-rdf/mapMatch.js#default>` takes named `map` and optional `subject`, `predicate`, `object`, and `graph` selectors. Each selector accepts an RDF/JS term or an iterable of terms. Omitted selectors leave that position unconstrained. The callback receives one matching quad and can return a promise. A regular function can access the RDF environment at `this.rdf`. Nonmatching quads pass through unchanged.

## `setGraph`

`<node:barnard59-rdf/setGraph.js#default>` takes a graph IRI string or RDF/JS term as its first positional argument. It rewrites the graph of every input quad, including quads that already have a named graph. Omit the argument or pass an empty string to use the default graph.

## `metadata.js#append`

`<node:barnard59-rdf/metadata.js#append>` forwards the incoming quads and appends metadata quads at the end. Pass a local path, URL, or readable quad stream as named `input`. Relative metadata paths use the pipeline's base directory when available. The optional `basepath` is a fallback for calls without a pipeline base path.

Use `graph` to set the metadata graph. `dateCreated` and `dateModified` can update recognized dataset resources. The literal `TIME_NOW` uses the current time. `TIME_FILE_CREATION` and `TIME_FILE_MODIFICATION` use timestamps from a local metadata file.

## `metadata.js#voidStats`

`<node:barnard59-rdf/metadata.js#voidStats>` passes through RDF/JS quads and emits VoID statistics after reading the input. Supply `voidDatasetUri` for the resource that receives the statistics. Use `classPartitions` and `propertyPartitions` to request statistics for specific classes and predicates. Run this after filtering when the statistics should describe the filtered output.

## `transformCodeImports`

`<node:barnard59-rdf/imports.js#default>` takes no arguments. It consumes a quad stream, follows its `code:imports` declarations, and merges imported quads into the output. Add it when the RDF data being processed contains import directives. The CLI already follows imports in pipeline definition files. See `barnard59-pipeline-imports` for that use.

## `members.js#toTarget`

Use the explicit `<node:barnard59-rdf/members.js#toTarget>` link. Supply named `targetUri`, `targetClass`, `property`, and a nonempty `classes` list. When a named subject has a type in `classes`, the step adds a relation from that subject to the target using `property`. It also emits the target's type assertion.

## `members.js#fromSource`

Use the explicit `<node:barnard59-rdf/members.js#fromSource>` link with `sourceUri`, `sourceClass`, `property`, and a nonempty `classes` list. It adds a relation from the shared source to each named subject with a matching type and emits the source's type assertion. Choose this direction for predicates such as `dcterms:hasPart`.
