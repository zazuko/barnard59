---
name: barnard59-formats
description: Use when parsing CSV, XLSX, JSON-LD, Turtle, TriG, N-Triples, N-Quads, or RDF/XML, or serializing RDF in a Barnard59 pipeline.
---

# Parse and serialize formats

Use `@prefix op: <https://barnard59.zazuko.com/operations/> .` and write `[ op:formats\/n3\/parse () ]` or `[ op:formats\/ntriples\/serialize () ]` in `p:stepList`. Explicit module links below use `node:barnard59-formats/`. Parsers emit one RDF/JS quad per object-mode chunk. Flatten datasets or arrays before passing them to a quad serializer.

## `csvw/parse`

`csvw.js#parse` consumes CSV bytes using CSV on the Web metadata. Pass the metadata dataset or a readable quad stream as the first positional argument, or use named `metadata` and parser options. The parser imports a metadata stream before processing CSV. A nested pipeline that reads and parses the mapping is a convenient way to supply it.

`timezone` defaults to `local` and `trimHeaders` defaults to true. Set `relaxColumnCount` or `skipLinesWithError` explicitly when the input warrants it. `skipEmptyLines` controls handling of empty rows. Use `barnard59-csvw`'s `fetch` when the mapping should also supply the location of the CSV bytes.

## `xlsx/parse`

`xlsx.js#parse` consumes binary XLSX data. Pass a CSVW metadata dataset or a readable metadata quad stream, either directly or as the named `metadata` option. Set `timezone` when dates in the workbook need a timezone other than the default `local`. Keep the workbook stream as the main input and load the metadata through a separate source.

## `jsonld/parse`

`jsonld.js#parse` consumes JSON-LD text and emits quads. For known local copies of JSON-LD contexts, pass the named `localContext` option as a URL-to-file mapping or a JSON string containing that mapping. The option lets a pipeline use its local copy when the input refers to the matching context URL.

## `jsonld/parse/object`

`jsonld.js#parseObject` accepts JavaScript objects in object mode and serializes them into one underlying JSON-LD parser. It takes no options. Use it for one complete object per pipeline invocation. Multiple object chunks can repeat quads from earlier chunks. Use a separate parser invocation for each independent document when output multiplicity matters.

## `jsonld/serialize`

`jsonld.js#serialize` takes no arguments. Feed it RDF/JS quads and write the resulting JSON-LD text to a byte sink. To serialize a stream of separate datasets as separate documents, use a separate nested pipeline invocation for each dataset.

## `n3/parse`

`n3.js#parse` consumes RDF text through the N3 parser. It handles Turtle, TriG, N-Triples, N-Quads, and N3 syntax. Pass named parser options such as `baseIRI` for resolving relative IRIs or `format` to choose the syntax explicitly. This step parses syntax. Use `barnard59-n3` for inference.

## `rdf-xml/parse`

`rdf-xml.js#parse` takes no arguments. It consumes RDF/XML text and creates RDF/JS quads with the pipeline's RDF factory. Connect the file or HTTP body directly to the parser, then pass the quads to graph operations or a serializer.

## `ntriples/serialize`

`ntriples.js#serialize` takes no arguments and renders RDF/JS quads as line-oriented RDF text. Default-graph quads produce N-Triples and named-graph quads include the graph term as N-Quads. If the consumer requires strict N-Triples, ensure the quads are in the default graph first. Use `barnard59-rdf`'s `setGraph` when intentionally dropping graph names.
