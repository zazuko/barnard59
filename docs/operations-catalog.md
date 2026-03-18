<!-- AUTO-GENERATED from manifest.ttl files. Do not edit manually. -->
<!-- Run: node scripts/generate-operations-catalog.js > docs/operations-catalog.md -->

# barnard59 Operations Catalog

## Stream Type Legend

| Type | Meaning |
|------|---------|
| `Readable` | Produces raw byte chunks |
| `ReadableObjectMode` | Produces objects (typically RDF/JS Quads) |
| `Writable` | Consumes raw byte chunks |
| `WritableObjectMode` | Consumes objects (typically RDF/JS Quads) |

## Compatibility Rules

Two consecutive steps are compatible when:
- `Readable` output connects to `Writable` input
- `ReadableObjectMode` output connects to `WritableObjectMode` input

**Invalid:** `Readable` → `WritableObjectMode` or `ReadableObjectMode` → `Writable`

## barnard59-base

| Operation | Simplified Syntax | Signature | Description |
|-----------|-------------------|-----------|-------------|
| Combine | `op:base/combine` | `Writable → Readable` | Combines multiple streams to a single stream connecting them in the given order. |
| Concat | `op:base/concat` | `→ Readable` | Concatenates the content of the given streams to a single stream. |
| Concat (Object) | `op:base/concat/object` | `→ ReadableObjectMode` | Concatenates the content of the given streams to a single stream. |
| Filter | `op:base/filter` | `WritableObjectMode → ReadableObjectMode` | Forwards incoming chunks if they pass the filter function. |
| Batch | `op:base/batch` | `WritableObjectMode → ReadableObjectMode` | Groups incoming items into arrays of the given size. |
| Flatten | `op:base/flatten` | `WritableObjectMode → ReadableObjectMode` | Separates incoming arrays into their elements and emits each element as a single chunk. |
| For Each | `op:base/forEach` | `WritableObjectMode → ReadableObjectMode` | Calls a sub pipeline for each incoming chunk. |
| Glob | `op:base/glob` | `→ ReadableObjectMode` | Match files using the given pattern and emits each filename as a single chunk. |
| Parse JSON | `op:base/json/parse` | `Writable → ReadableObjectMode` | Converts each chunk to an object by calling JSON.parse(). |
| Serialize JSON | `op:base/json/stringify` | `WritableObjectMode → Readable` | Converts each chunk to a JSON string by calling JSON.stringify(). |
| Limit | `op:base/limit` | `WritableObjectMode → ReadableObjectMode` | Limits the amount of forwarded chunks and discards any chunks after reaching the limit. |
| Map | `op:base/map` | `WritableObjectMode → ReadableObjectMode` | Converts each chunk using the given function. |
| /dev/null | `op:base/nul` | `WritableObjectMode →` | Dummy output stream, just like /dev/null. |
| Offset | `op:base/offset` | `WritableObjectMode → ReadableObjectMode` | Discards all chunks before the given offset. |
| stdout | `op:base/stdout` | `Writable → Readable` | Writes the incoming data to stdout and also forwards the data to the stream output. |
| stdin | `op:base/stdin` | `Writable → Readable` | Reads from standard input |
| To String | `op:base/toString` | `WritableObjectMode → Readable` | Converts each chunk to a string by calling .toString(). |
| Stream values | `op:base/streamValues` | `→ ReadableObjectMode` | Creates a readable stream from the given array. |

## barnard59-core

| Operation | Simplified Syntax | Signature | Description |
|-----------|-------------------|-----------|-------------|
| Read file | `op:core/fs/createReadStream` | `→ Readable` | Reads a file from the local file system. |
| Write file | `op:core/fs/createWriteStream` | `Writable →` | Writes a file to the local file system. |

## barnard59-csvw

| Operation | Simplified Syntax | Signature | Description |
|-----------|-------------------|-----------|-------------|
| Fetch CSVW | `op:csvw/fetch` | `→ Readable` | Loads a CSVW file from the local filesystem or the web depending on the given argument |

## barnard59-cube

| Operation | Simplified Syntax | Signature | Description |
|-----------|-------------------|-----------|-------------|
| build Cube Shape | `op:cube/buildCubeShape` | `WritableObjectMode → ReadableObjectMode` | Builds a Cube Shape based on Cube Observation datasets |
| to Cube Observation | `op:cube/toObservation` | `WritableObjectMode → ReadableObjectMode` | Converts a set of quads to a Cube Observation |

## barnard59-formats

| Operation | Simplified Syntax | Signature | Description |
|-----------|-------------------|-----------|-------------|
| Parse CSV on the Web | `op:formats/csvw/parse` | `Writable → ReadableObjectMode` | Parses the given CSV stream using the given metadata. |
| Parse JSON-LD | `op:formats/jsonld/parse` | `Writable → ReadableObjectMode` | Parses the given JSON-LD stream. |
| Parse JSON-LD (Object) | `op:formats/jsonld/parse/object` | `WritableObjectMode → ReadableObjectMode` | Parses the given JSON-LD stream. |
| Serialize JSON-LD | `op:formats/jsonld/serialize` | `WritableObjectMode → Readable` | Serializes the given RDF/JS Quads to JSON-LD. |
| Parse N3 | `op:formats/n3/parse` | `Writable → ReadableObjectMode` | Parses the given N3 stream. |
| Serialize N-Triples | `op:formats/ntriples/serialize` | `WritableObjectMode → Readable` | Serializes the given RDF/JS Quads to N-Triples. |
| Parse RDF/XML | `op:formats/rdf-xml/parse` | `Writable → ReadableObjectMode` | Parses the given RDF/XML stream. |
| Parse XSLX files based on the CSV on the Web standard | `op:formats/xlsx/parse` | `Writable → ReadableObjectMode` | Parses the given XLSX stream using the given metadata. |

## barnard59-ftp

| Operation | Simplified Syntax | Signature | Description |
|-----------|-------------------|-----------|-------------|
| List files (FTP) | `op:ftp/list` | `→ ReadableObjectMode` | Lists all files in the given FTP folder. |
| Move file (FTP) | `op:ftp/move` | `Writable → Readable` | Moves the given file at the end of the stream processing and forwards any incoming data. |
| Read file (FTP) | `op:ftp/read` | `→ Readable` | Reads the given file. |
| Put file (FTP) | `op:ftp/write` | `Writable →` | Uploads the stream to FTP. |

## barnard59-graph-store

| Operation | Simplified Syntax | Signature | Description |
|-----------|-------------------|-----------|-------------|
| Read RDF/JS Quads (Graph Store) | `op:graph-store/get` | `→ ReadableObjectMode` | Reads RDF/JS Quads from the given named graph using the SPARQL Graph Store Protocol. |
| Append RDF/JS Quads (Graph Store) | `op:graph-store/post` | `WritableObjectMode →` | Appends RDF/JS Quads to the given named graph using the SPARQL Graph Store Protocol. |
| Write RDF/JS Quads (Graph Store) | `op:graph-store/put` | `WritableObjectMode →` | Writes RDF/JS Quads to the given named graph using the SPARQL Graph Store Protocol. |

## barnard59-http

| Operation | Simplified Syntax | Signature | Description |
|-----------|-------------------|-----------|-------------|
| HTTP GET request | `op:http/get` | `→ Readable` | Makes a HTTP GET request and returns the body of the response as stream. |
| HTTP POST request | `op:http/post` | `Writable → Readable` | Makes a HTTP POST request, sends the written data as request body and returns the body of the response as stream. |

## barnard59-rdf

| Operation | Simplified Syntax | Signature | Description |
|-----------|-------------------|-----------|-------------|
| Map (RDF/JS Quad) | `op:rdf/mapMatch` | `WritableObjectMode → ReadableObjectMode` | Calls a map function only for quads matching the given triple pattern. |
| Set Graph | `op:rdf/setGraph` | `WritableObjectMode → ReadableObjectMode` | Sets the graph of all quads to the given fixed value. |
| Append metadata | `op:rdf/metadata.js#append` | `WritableObjectMode → ReadableObjectMode` | Fetches, updates and appends a metadata resource |
| Void statistics | `op:rdf/metadata.js#voidStats` | `WritableObjectMode → ReadableObjectMode` | Appends void statistics, such as counts for entities and properties |
| Parse RDF file | `op:rdf/fs.js#parse` | `→ ReadableObjectMode` | Opens and parses an RDF file, choosing the correct parser based on the extension |
| Combine RDF stream to dataset | `op:rdf/getDataset` | `WritableObjectMode → ReadableObjectMode` | The entire RDF stream is combined into a single dataset |
| Splits RDF stream on graph | `op:rdf/splitDataset/byGraph` | `WritableObjectMode → ReadableObjectMode` | Combines streamed quads into datasets. A new dataset is pushed when graph changes |
| Splits RDF stream on predicate | `op:rdf/splitDataset/byPredicate` | `WritableObjectMode → ReadableObjectMode` | Combines streamed quads into datasets. A new dataset is pushed when predicate changes |
| Splits RDF stream on subject | `op:rdf/splitDataset/bySubject` | `WritableObjectMode → ReadableObjectMode` | Combines streamed quads into datasets. A new dataset is pushed when subject changes |
| Splits RDF stream by RDF type | `op:rdf/splitDataset/byType` | `WritableObjectMode → ReadableObjectMode` | Combines streamed quads into datasets. A new dataset is pushed when an rdf:type triple is encountered |
| Opens an RDF from web or local file | `op:rdf/open` | `→ ReadableObjectMode` | Web resource requires content-type header. Will try n-triples as fallback. Local paths will be relative to the current working directory |
| Transforms code:imports triples by fetching remote graphs and mergin them with the passing stream | `op:rdf/transformCodeImports` | `WritableObjectMode → ReadableObjectMode` |  |

## barnard59-s3

| Operation | Simplified Syntax | Signature | Description |
|-----------|-------------------|-----------|-------------|
| Put an object to S3 | `op:s3/putObject` | `(no stream metadata)` | Put an object to a S3 bucket. |
| Get S3 object | `op:s3/getObject` | `(no stream metadata)` | Get an object from a S3 bucket. |
| Get S3 object as stream | `op:s3/getObject/stream` | `→ Readable` | Get an object from a S3 bucket as a Readable stream. |

## barnard59-shacl

| Operation | Simplified Syntax | Signature | Description |
|-----------|-------------------|-----------|-------------|
| validate rdf | `op:shacl/validate` | `→ Readable` | Validates a RDF graph against a set of conditions specified in a SHACL document |
| validate rdf | `op:shacl/report` | `→ Readable` | Validates a RDF graph against a set of conditions specified in a SHACL document, returning the validation report |

## barnard59-sparql

| Operation | Simplified Syntax | Signature | Description |
|-----------|-------------------|-----------|-------------|
| SPARQL Construct | `op:sparql/construct` | `→ ReadableObjectMode` | Runs the given CONSTRUCT query against the given endpoint parses the result. |
| SPARQL Select | `op:sparql/select` | `→ ReadableObjectMode` | Runs the given SELECT query against the given endpoint parses the result into rows of RDF/JS key-value pairs. |
| SPARQL in-memory Update | `op:sparql/in-memory/update` | `→ ReadableObjectMode` | Runs the given DELETE/INSERT command against each input chunk. |
| SPARQL in-memory Query | `op:sparql/in-memory/query` | `→ ReadableObjectMode` | Runs the given query against each input chunk. |

## Operations by Role

### Source Operations (can START a pipeline)

- `op:base/concat` → Readable — Concat
- `op:base/concat/object` → ReadableObjectMode — Concat (Object)
- `op:base/glob` → ReadableObjectMode — Glob
- `op:base/streamValues` → ReadableObjectMode — Stream values
- `op:core/fs/createReadStream` → Readable — Read file
- `op:csvw/fetch` → Readable — Fetch CSVW
- `op:ftp/list` → ReadableObjectMode — List files (FTP)
- `op:ftp/read` → Readable — Read file (FTP)
- `op:graph-store/get` → ReadableObjectMode — Read RDF/JS Quads (Graph Store)
- `op:http/get` → Readable — HTTP GET request
- `op:rdf/fs.js#parse` → ReadableObjectMode — Parse RDF file
- `op:rdf/open` → ReadableObjectMode — Opens an RDF from web or local file
- `op:s3/getObject/stream` → Readable — Get S3 object as stream
- `op:shacl/validate` → Readable — validate rdf
- `op:shacl/report` → Readable — validate rdf
- `op:sparql/construct` → ReadableObjectMode — SPARQL Construct
- `op:sparql/select` → ReadableObjectMode — SPARQL Select
- `op:sparql/in-memory/update` → ReadableObjectMode — SPARQL in-memory Update
- `op:sparql/in-memory/query` → ReadableObjectMode — SPARQL in-memory Query

### Sink Operations (can END a pipeline)

- WritableObjectMode → `op:base/nul` — /dev/null
- Writable → `op:core/fs/createWriteStream` — Write file
- Writable → `op:ftp/write` — Put file (FTP)
- WritableObjectMode → `op:graph-store/post` — Append RDF/JS Quads (Graph Store)
- WritableObjectMode → `op:graph-store/put` — Write RDF/JS Quads (Graph Store)

### Transform Operations (middle of pipeline)

- `op:base/combine`: Writable → Readable — Combine
- `op:base/filter`: WritableObjectMode → ReadableObjectMode — Filter
- `op:base/batch`: WritableObjectMode → ReadableObjectMode — Batch
- `op:base/flatten`: WritableObjectMode → ReadableObjectMode — Flatten
- `op:base/forEach`: WritableObjectMode → ReadableObjectMode — For Each
- `op:base/json/parse`: Writable → ReadableObjectMode — Parse JSON
- `op:base/json/stringify`: WritableObjectMode → Readable — Serialize JSON
- `op:base/limit`: WritableObjectMode → ReadableObjectMode — Limit
- `op:base/map`: WritableObjectMode → ReadableObjectMode — Map
- `op:base/offset`: WritableObjectMode → ReadableObjectMode — Offset
- `op:base/stdout`: Writable → Readable — stdout
- `op:base/stdin`: Writable → Readable — stdin
- `op:base/toString`: WritableObjectMode → Readable — To String
- `op:cube/buildCubeShape`: WritableObjectMode → ReadableObjectMode — build Cube Shape
- `op:cube/toObservation`: WritableObjectMode → ReadableObjectMode — to Cube Observation
- `op:formats/csvw/parse`: Writable → ReadableObjectMode — Parse CSV on the Web
- `op:formats/jsonld/parse`: Writable → ReadableObjectMode — Parse JSON-LD
- `op:formats/jsonld/parse/object`: WritableObjectMode → ReadableObjectMode — Parse JSON-LD (Object)
- `op:formats/jsonld/serialize`: WritableObjectMode → Readable — Serialize JSON-LD
- `op:formats/n3/parse`: Writable → ReadableObjectMode — Parse N3
- `op:formats/ntriples/serialize`: WritableObjectMode → Readable — Serialize N-Triples
- `op:formats/rdf-xml/parse`: Writable → ReadableObjectMode — Parse RDF/XML
- `op:formats/xlsx/parse`: Writable → ReadableObjectMode — Parse XSLX files based on the CSV on the Web standard
- `op:ftp/move`: Writable → Readable — Move file (FTP)
- `op:http/post`: Writable → Readable — HTTP POST request
- `op:rdf/mapMatch`: WritableObjectMode → ReadableObjectMode — Map (RDF/JS Quad)
- `op:rdf/setGraph`: WritableObjectMode → ReadableObjectMode — Set Graph
- `op:rdf/metadata.js#append`: WritableObjectMode → ReadableObjectMode — Append metadata
- `op:rdf/metadata.js#voidStats`: WritableObjectMode → ReadableObjectMode — Void statistics
- `op:rdf/getDataset`: WritableObjectMode → ReadableObjectMode — Combine RDF stream to dataset
- `op:rdf/splitDataset/byGraph`: WritableObjectMode → ReadableObjectMode — Splits RDF stream on graph
- `op:rdf/splitDataset/byPredicate`: WritableObjectMode → ReadableObjectMode — Splits RDF stream on predicate
- `op:rdf/splitDataset/bySubject`: WritableObjectMode → ReadableObjectMode — Splits RDF stream on subject
- `op:rdf/splitDataset/byType`: WritableObjectMode → ReadableObjectMode — Splits RDF stream by RDF type
- `op:rdf/transformCodeImports`: WritableObjectMode → ReadableObjectMode — Transforms code:imports triples by fetching remote graphs and mergin them with the passing stream
