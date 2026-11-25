---
name: barnard59-base
description: Use when composing or transforming Barnard59 streams with mapping, filtering, batching, flattening, JSON chunks, standard I/O, globbing, or nested pipelines.
---

# Base stream steps

Declare `@prefix op: <https://barnard59.zazuko.com/operations/> .` at the top of your Turtle file. In `p:stepList`, write `[ op:base\/batch (10) ]` to group incoming chunks into batches of ten.

For an explicit `p:Step`, link to the JavaScript export with `code:link`. For example, the link for `batch` is `<node:barnard59-base/batch.js#default>`. The other module paths below follow the same pattern.

## `streamValues`

`Readable.js#from` takes each positional argument as a separate value and emits it as one object-mode chunk. Use `[ op:base\/streamValues ("first" "second") ]` for a fixed list of work items or a small fixture. Passing a list as a single argument emits that list as one chunk.

## `glob`

`glob.js#default` takes named `pattern` and optional glob settings such as `cwd` and `nodir`. It emits one matched path string per object-mode chunk. Relative patterns start at the working directory unless you set `cwd`. Use `nodir true` for file readers and pass the results to `barnard59-rdf`'s `fs.js#parse` or a `forEach` subpipeline to open the matches.

## `stdin`

`process.js#stdin` takes no arguments and returns the byte stream from standard input. Put it first when the CLI should accept redirected files or input from a shell pipe. Add a parser when downstream steps expect objects or quads.

## `stdout`

`process.js#stdout` takes no arguments. It writes incoming bytes to stdout and forwards those bytes downstream. Use it when a pipeline explicitly needs that side effect. A readable CLI pipeline already prints its output by default, so including this step in that path can print the same bytes twice.

## `map`

`map.js#default` takes a function as the first positional argument or named options with a `map` function. The callback receives `(chunk, ...args)` and may return a value or a promise. Use a regular function to access the pipeline context through `this`.

The default is object mode, concurrency `1`, and ordered output. Raise `concurrency` for independent asynchronous work. Set `ordered false` only when downstream steps can accept completion order. In programmatic calls, additional arguments follow the callback or options object.

## `filter`

`filter.js#default` takes a predicate followed by any additional positional arguments. It calls `predicate(chunk, encoding, ...args)` in the pipeline context and awaits the result. A truthy result forwards the original object-mode chunk. Use `map` when the operation needs to change the chunk as well.

## `limit`

`limit.js#default` takes a positional chunk count and emits up to the first N chunks. Place it before expensive work to sample a stream or after `filter` to keep the first N matches. It counts the chunks at that point in the pipeline, so a batch counts as one chunk.

## `offset`

`offset.js#default` takes a positional chunk count and discards the first N chunks before forwarding the remainder. Pair it with `limit` after a source with a stable order for a repeatable slice.

## `batch`

`batch.js#default` takes a positional size and groups object-mode input into arrays of that size. It emits the final partial array at end of input. A size of `0`, the default, collects all input into one array, so use it for bounded input. Choose boundaries that keep related quads together when batch contents affect query or validation results.

## `flatten`

`flatten.js#default` takes no arguments. Each chunk must be iterable or implement `forEach`. The step emits its members individually in object mode and expands one level. Place it between dataset or array output and a step that expects one RDF/JS quad per chunk.

## `concat`

`concat.js#default` takes readable streams as separate positional arguments. It drains them in argument order and exposes one byte stream without inserting separators. For example, `[ op:base\/concat (ex:header ex:body) ]` can join two byte-producing subpipelines.

## `concat/object`

`concat.js#object` takes the same positional stream arguments and emits their chunks sequentially in object mode. Use it to join quad streams, records, or dataset chunks. Each input chunk is forwarded unchanged, including a grouped dataset.

## `combine`

`combine.js#default` takes a nonempty array of streams and an optional duplex-options object. It pipes each stream into the next and exposes the first stream's writable side and the last stream's readable side as one duplex. Supply `objectMode` or side-specific stream options when needed. Use `concat` to drain independent sources in sequence.

## `forEach`

`forEach.js#default` takes a nested pipeline and an optional variable name as positional arguments. It creates a new pipeline for each object-mode input chunk. The nested pipeline inherits the caller's variables, and the named variable receives the current chunk. If the nested pipeline is writable, the chunk is also sent to its input. Its readable output is forwarded before work starts on the next chunk.

Define `ex:readOne` as a `p:Pipeline`, then use `[ op:base\/forEach (ex:readOne "filename") ]` after `glob` to open each path through a fresh nested pipeline.

## `json/parse`

`json.js#parse` takes no arguments. It parses each byte chunk as one complete JSON value and emits the result in object mode.

## `json/parse/document`

`json.js#parseDocument` takes no arguments. Use `[ op:base\/json\/parse\/document () ]` after a file or HTTP source that yields one bounded JSON document across arbitrary byte chunks. It buffers the stream, then parses the document and emits its value in object mode. A top-level JSON null emits no chunk.

## `json/stringify`

`json.js#stringify` takes no arguments and emits the JSON serialization of each object-mode chunk as bytes. It adds neither newlines nor array framing. Supply framing separately for JSON Lines or a single JSON document with several values.

## `toString`

`toString.js#default` takes no arguments. It calls `toString()` on each object-mode input chunk and exposes a byte-mode readable side. Use this for text representations the object already defines. Use `json/stringify` or an RDF serializer when the downstream format requires structured encoding.

## `nul`

`dev-nul.js#default` takes no arguments and consumes object-mode chunks without producing output. Use it as a terminal sink when upstream work should run to completion and its output can be discarded.
