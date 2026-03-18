# barnard59 LLM Pipeline Generation Instructions

This document provides everything needed to generate valid barnard59 RDF pipelines. Read it fully before generating any pipeline.

---

## 1. What is barnard59?

barnard59 is an RDF/Linked Data ETL (Extract, Transform, Load) toolkit. Pipelines are described in **Turtle (RDF)** using the [pipeline](https://pipeline.described.at/) and [code](https://code.described.at/) ontologies. At runtime, each pipeline step is a Node.js stream; steps are chained via `.pipe()` like Unix pipes.

**Key properties:**
- Pipelines are declarative RDF files (`.ttl` extension)
- Steps are Node.js streams; compatibility depends on stream type
- The repo is an ESM monorepo (`"type": "module"`)

---

## 2. Required Prefixes

Always include these prefixes:

```turtle
@prefix p:    <https://pipeline.described.at/> .
@prefix code: <https://code.described.at/> .
@prefix op:   <https://barnard59.zazuko.com/operations/> .
```

Additional prefixes as needed:
```turtle
@prefix rdf:  <http://www.w3.org/1999/02/22-rdf-syntax-ns#> .
@prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> .
```

---

## 3. Stream Type System

Every operation has an input type and an output type. Consecutive steps must have compatible types.

| Type | Direction | Content |
|------|-----------|---------|
| `Readable` | output | raw byte chunks |
| `ReadableObjectMode` | output | RDF/JS Quad objects |
| `Writable` | input | raw byte chunks |
| `WritableObjectMode` | input | RDF/JS Quad objects |

### Compatibility Rules

Only these connections are valid:

| Previous step output | Next step input | Valid? |
|---------------------|-----------------|--------|
| `Readable` | `Writable` | ✅ |
| `ReadableObjectMode` | `WritableObjectMode` | ✅ |
| `Readable` | `WritableObjectMode` | ❌ (type mismatch) |
| `ReadableObjectMode` | `Writable` | ❌ (type mismatch) |

### Pipeline Type Declaration

The pipeline's declared types must match its first and last steps:
- If the **first** step is `Writable` or `WritableObjectMode`, declare `p:Writable` on the pipeline
- If the **last** step is `Readable` or `ReadableObjectMode`, declare `p:Readable` or `p:ReadableObjectMode` on the pipeline
- A self-contained pipeline (source → sink with no external I/O) typically declares only `p:Pipeline`

**Common signatures notation used in this document:**
- `→ Readable` means: no input, produces bytes (source)
- `→ ReadableObjectMode` means: no input, produces quads (source)
- `Writable → ReadableObjectMode` means: consumes bytes, produces quads (transform)
- `WritableObjectMode →` means: consumes quads, no output (sink)

---

## 4. Pipeline Syntax

### 4.1 Simplified Syntax (Preferred)

Inline operation calls directly in the step list. Use this whenever possible.

```turtle
@base <http://example.org/pipeline/> .
@prefix p:    <https://pipeline.described.at/> .
@prefix code: <https://code.described.at/> .
@prefix op:   <https://barnard59.zazuko.com/operations/> .

<pipeline> a p:Pipeline, p:Readable ;
  p:steps [
    p:stepList (
      [ op:http\/get ( [ code:name "url" ; code:value "https://example.org/data.ttl" ] ) ]
      [ op:formats\/n3\/parse () ]
      [ op:formats\/ntriples\/serialize () ]
    )
  ] .
```

**Rules for simplified syntax:**
- Each step is a blank node `[ op:some\/operation ( ...args ) ]`
- **Escape slashes** in operation IRIs: `op:formats\/n3\/parse`, `op:graph-store\/put`
- No-argument operations: `[ op:formats\/n3\/parse () ]`
- Positional arguments: `[ op:core\/fs\/createReadStream ( "input.txt" ) ]`
- Named arguments: `[ op:http\/get ( [ code:name "url" ; code:value "..." ] ) ]`

### 4.2 Verbose Syntax (Fallback)

Use when steps need named IRIs for reuse or sub-pipeline references.

```turtle
@base <http://example.org/pipeline/> .
@prefix p:    <https://pipeline.described.at/> .
@prefix code: <https://code.described.at/> .

<pipeline> a p:Pipeline, p:Readable ;
  p:steps [
    p:stepList ( <readFile> <parseN3> <serializeNTriples> )
  ] .

<readFile> a p:Step ;
  code:implementedBy [ a code:EcmaScriptModule ;
    code:link <node:fs#createReadStream>
  ] ;
  code:arguments ( "input.ttl" ) .

<parseN3> a p:Step ;
  code:implementedBy [ a code:EcmaScriptModule ;
    code:link <node:barnard59-formats/n3.js#parse>
  ] .

<serializeNTriples> a p:Step ;
  code:implementedBy [ a code:EcmaScriptModule ;
    code:link <node:barnard59-formats/ntriples.js#serialize>
  ] .
```

**`code:link` IRI formats:**
- `<node:package-name#export>` — Node.js package export
- `<node:package-name/path.js#export>` — specific file within package
- `<file:../lib/myStep.js#default>` — local file (path relative to pipeline file)

### 4.3 Arguments

**Positional (list):**
```turtle
code:arguments ( "value1" "value2" ) .
```

**Named (key-value blank nodes):**
```turtle
code:arguments
  [ code:name "endpoint" ; code:value "https://..." ] ,
  [ code:name "user"     ; code:value "admin"        ] .
```

**Mixed (positional list with blank-node values):**
```turtle
[ op:http\/get ( [ code:name "url" ; code:value "https://..." ] ) ]
```

---

## 5. Variable System

Variables parameterize pipelines for CLI overrides or reuse.

### 5.1 Declaring Variables

```turtle
<pipeline> a p:Pipeline ;
  p:variables [
    p:variable
      [ a p:Variable ; p:name "endpoint" ; p:value "http://localhost:3030/data" ] ,
      [ a p:Variable ; p:name "graph"    ; p:value "https://example.org/graph"  ]
  ] .
```

Variables can also be declared in a shared blank node and referenced:
```turtle
<defaultVars>
  p:variable
    [ a p:Variable ; p:name "ENDPOINT" ; p:value "http://localhost:3030/data" ] ,
    [ a p:Variable ; p:name "USERNAME" ; p:value "" ] .

<pipeline> a p:Pipeline ;
  p:variables <defaultVars> .
```

### 5.2 Using Variables

**As datatype literal** — replaced with the variable value at runtime:
```turtle
code:arguments ( "endpoint"^^p:VariableName ) .
```

**As template literal** — ES6-style interpolation:
```turtle
code:arguments ( "file:${basePath}/data.csv"^^code:EcmaScriptTemplateLiteral ) .
```

**In ECMAScript code** — accessed via `this.variables.get('name')`:
```turtle
code:arguments ( """quad => {
  const base = this.variables.get('baseIri')
  return base + quad.subject.value
}"""^^code:EcmaScript ) .
```

### 5.3 CLI Override

Variables can be overridden at runtime:
```bash
barnard59 run pipeline.ttl --pipeline <#main> --variable endpoint=http://prod:3030/data
```

---

## 6. Operations Catalog

The full operations catalog is auto-generated from `manifest.ttl` files and lives at [docs/operations-catalog.md](./operations-catalog.md).

Below is a quick-reference summary organized by role. For descriptions and signatures see the full catalog.

### Source Operations (start a pipeline — no input required)

| Operation | Output | Description |
|-----------|--------|-------------|
| `op:core\/fs\/createReadStream` | `Readable` | Read local file |
| `op:http\/get` | `Readable` | HTTP GET |
| `op:ftp\/read` | `Readable` | Read file from FTP/SFTP |
| `op:s3\/getObject\/stream` | `Readable` | Read S3 object as stream |
| `op:csvw\/fetch` | `Readable` | Fetch CSVW from file or web |
| `op:rdf\/fs.js#parse` | `ReadableObjectMode` | Open + parse RDF file (auto-detects format) |
| `op:rdf\/open` | `ReadableObjectMode` | Open RDF from web or local path |
| `op:graph-store\/get` | `ReadableObjectMode` | Read named graph via SPARQL Graph Store |
| `op:sparql\/construct` | `ReadableObjectMode` | SPARQL CONSTRUCT query |
| `op:sparql\/select` | `ReadableObjectMode` | SPARQL SELECT query (rows as quad maps) |
| `op:base\/glob` | `ReadableObjectMode` | Glob files → emit filenames |
| `op:base\/concat` | `Readable` | Concatenate multiple byte streams |
| `op:base\/concat\/object` | `ReadableObjectMode` | Concatenate multiple quad streams |
| `op:base\/streamValues` | `ReadableObjectMode` | Emit items from a static array |
| `op:ftp\/list` | `ReadableObjectMode` | List FTP directory |

### Transform Operations (middle — bytes-to-bytes, bytes-to-quads, quads-to-quads, quads-to-bytes)

**Parsing (bytes → quads):**

| Operation | Signature | Description |
|-----------|-----------|-------------|
| `op:formats\/n3\/parse` | `Writable → ReadableObjectMode` | Parse Turtle/N3/N-Triples/TriG |
| `op:formats\/ntriples\/serialize` | `WritableObjectMode → Readable` | Serialize to N-Triples |
| `op:formats\/jsonld\/parse` | `Writable → ReadableObjectMode` | Parse JSON-LD bytes |
| `op:formats\/jsonld\/serialize` | `WritableObjectMode → Readable` | Serialize to JSON-LD |
| `op:formats\/rdf-xml\/parse` | `Writable → ReadableObjectMode` | Parse RDF/XML |
| `op:formats\/csvw\/parse` | `Writable → ReadableObjectMode` | Parse CSVW (needs metadata) |
| `op:formats\/xlsx\/parse` | `Writable → ReadableObjectMode` | Parse XLSX via CSVW metadata |
| `op:base\/json\/parse` | `Writable → ReadableObjectMode` | Parse JSON bytes to objects |
| `op:base\/json\/stringify` | `WritableObjectMode → Readable` | Serialize objects to JSON |

**Quad transforms (quads → quads):**

| Operation | Description |
|-----------|-------------|
| `op:rdf\/setGraph` | Set named graph on all quads |
| `op:rdf\/mapMatch` | Map function over matching quads |
| `op:rdf\/getDataset` | Collect entire stream into one dataset |
| `op:rdf\/splitDataset\/bySubject` | Split stream into per-subject datasets |
| `op:rdf\/splitDataset\/byGraph` | Split stream into per-graph datasets |
| `op:rdf\/splitDataset\/byPredicate` | Split stream into per-predicate datasets |
| `op:rdf\/splitDataset\/byType` | Split on rdf:type triples |
| `op:base\/filter` | Forward only passing chunks |
| `op:base\/map` | Transform each chunk |
| `op:base\/forEach` | Run sub-pipeline per chunk |
| `op:base\/flatten` | Flatten arrays to individual items |
| `op:base\/batch` | Group chunks into arrays |
| `op:base\/limit` | Limit number of chunks |
| `op:base\/offset` | Skip first N chunks |
| `op:cube\/toObservation` | Convert quads to RDF Data Cube observations |
| `op:cube\/buildCubeShape` | Build SHACL cube shape from observations |
| `op:rdf\/metadata.js#append` | Fetch and append metadata resource |
| `op:rdf\/metadata.js#voidStats` | Append VoID statistics |
| `op:sparql\/in-memory\/update` | Run SPARQL UPDATE per chunk |
| `op:sparql\/in-memory\/query` | Run SPARQL query per chunk |

**Byte transforms:**

| Operation | Description |
|-----------|-------------|
| `op:base\/toString` | `WritableObjectMode → Readable` — call `.toString()` on chunks |
| `op:base\/stdout` | `Writable → Readable` — tee to stdout |
| `op:http\/post` | `Writable → Readable` — HTTP POST, returns response body |
| `op:ftp\/move` | `Writable → Readable` — move FTP file, forward data |

### Sink Operations (end a pipeline — no output)

| Operation | Input | Description |
|-----------|-------|-------------|
| `op:core\/fs\/createWriteStream` | `Writable` | Write local file |
| `op:ftp\/write` | `Writable` | Upload to FTP |
| `op:graph-store\/put` | `WritableObjectMode` | Replace named graph (Graph Store PUT) |
| `op:graph-store\/post` | `WritableObjectMode` | Append to named graph (Graph Store POST) |
| `op:base\/nul` | `WritableObjectMode` | Discard (like /dev/null) |

---

## 7. Common Patterns

### 7.1 HTTP → Parse → Serialize → File

```turtle
@base <http://example.org/pipeline/> .
@prefix p:    <https://pipeline.described.at/> .
@prefix code: <https://code.described.at/> .
@prefix op:   <https://barnard59.zazuko.com/operations/> .

<main> a p:Pipeline ;
  p:steps [
    p:stepList (
      [ op:http\/get ( [ code:name "url" ; code:value "https://example.org/data.ttl" ] ) ]
      [ op:formats\/n3\/parse () ]
      [ op:formats\/ntriples\/serialize () ]
      [ op:core\/fs\/createWriteStream ( "output.nt" ) ]
    )
  ] .
```

Stream flow: `→ Readable → (Writable|ReadableObjectMode) → (WritableObjectMode|Readable) → Writable`

Step-by-step types:
1. `op:http/get`: `→ Readable`
2. `op:formats/n3/parse`: `Writable → ReadableObjectMode`
3. `op:formats/ntriples/serialize`: `WritableObjectMode → Readable`
4. `op:core/fs/createWriteStream`: `Writable →`

### 7.2 File → Parse → setGraph → Graph Store PUT

```turtle
@base <http://example.org/pipeline/> .
@prefix p:    <https://pipeline.described.at/> .
@prefix code: <https://code.described.at/> .
@prefix op:   <https://barnard59.zazuko.com/operations/> .

<main> a p:Pipeline ;
  p:variables [
    p:variable
      [ a p:Variable ; p:name "endpoint" ; p:value "http://localhost:3030/data" ] ,
      [ a p:Variable ; p:name "graph"    ; p:value "https://example.org/my-graph" ] ,
      [ a p:Variable ; p:name "user"     ; p:value "" ] ,
      [ a p:Variable ; p:name "password" ; p:value "" ]
  ] ;
  p:steps [
    p:stepList (
      [ op:core\/fs\/createReadStream ( "input.ttl" ) ]
      [ op:formats\/n3\/parse () ]
      [ op:rdf\/setGraph ( [ code:name "graph" ; code:value "graph"^^p:VariableName ] ) ]
      [ op:graph-store\/put (
          [ code:name "endpoint" ; code:value "endpoint"^^p:VariableName ]
          [ code:name "user"     ; code:value "user"^^p:VariableName     ]
          [ code:name "password" ; code:value "password"^^p:VariableName ]
        ) ]
    )
  ] .
```

### 7.3 SPARQL CONSTRUCT → setGraph → Graph Store PUT

```turtle
@base <http://example.org/pipeline/> .
@prefix p:    <https://pipeline.described.at/> .
@prefix code: <https://code.described.at/> .
@prefix op:   <https://barnard59.zazuko.com/operations/> .

<main> a p:Pipeline ;
  p:variables [
    p:variable
      [ a p:Variable ; p:name "sourceEndpoint" ; p:value "https://query.example.org/sparql" ] ,
      [ a p:Variable ; p:name "targetEndpoint" ; p:value "http://localhost:3030/data"        ] ,
      [ a p:Variable ; p:name "graph"          ; p:value "https://example.org/derived-graph" ]
  ] ;
  p:steps [
    p:stepList (
      [ op:sparql\/construct (
          [ code:name "query"    ; code:value "CONSTRUCT { ?s ?p ?o } WHERE { ?s ?p ?o }" ]
          [ code:name "endpoint" ; code:value "sourceEndpoint"^^p:VariableName             ]
        ) ]
      [ op:rdf\/setGraph ( [ code:name "graph" ; code:value "graph"^^p:VariableName ] ) ]
      [ op:graph-store\/put (
          [ code:name "endpoint" ; code:value "targetEndpoint"^^p:VariableName ]
        ) ]
    )
  ] .
```

### 7.4 Glob → forEach (Sub-pipeline) → Serialize → File

Process each file matched by a glob pattern through a sub-pipeline.

```turtle
@base <http://example.org/pipeline/> .
@prefix p:    <https://pipeline.described.at/> .
@prefix code: <https://code.described.at/> .
@prefix op:   <https://barnard59.zazuko.com/operations/> .

<main> a p:Pipeline ;
  p:variables [
    p:variable
      [ a p:Variable ; p:name "pattern" ; p:value "data/*.ttl" ]
  ] ;
  p:steps [
    p:stepList (
      [ op:base\/glob (
          [ code:name "pattern" ; code:value "pattern"^^p:VariableName ]
        ) ]
      [ op:base\/forEach ( <parseTurtle> "filename" ) ]
      [ op:formats\/ntriples\/serialize () ]
      [ op:core\/fs\/createWriteStream ( "output.nt" ) ]
    )
  ] .

<parseTurtle> a p:Pipeline, p:ReadableObjectMode ;
  p:steps [
    p:stepList (
      [ op:core\/fs\/createReadStream ( "filename"^^p:VariableName ) ]
      [ op:formats\/n3\/parse () ]
    )
  ] .
```

**forEach signature:** `[ op:base\/forEach ( <subPipeline> "variableName" ) ]`
- `<subPipeline>` — IRI of a pipeline that receives the variable
- `"variableName"` — the pipeline variable name that receives each chunk value

### 7.5 Concatenate Multiple Sources

Merge multiple quad streams into one:

```turtle
@base <http://example.org/pipeline/> .
@prefix p:    <https://pipeline.described.at/> .
@prefix code: <https://code.described.at/> .
@prefix op:   <https://barnard59.zazuko.com/operations/> .

<main> a p:Pipeline ;
  p:steps [
    p:stepList (
      [ op:base\/concat\/object ( <sourceA> <sourceB> <sourceC> ) ]
      [ op:formats\/ntriples\/serialize () ]
      [ op:core\/fs\/createWriteStream ( "merged.nt" ) ]
    )
  ] .

<sourceA> a p:Pipeline, p:ReadableObjectMode ;
  p:steps [
    p:stepList (
      [ op:core\/fs\/createReadStream ( "a.ttl" ) ]
      [ op:formats\/n3\/parse () ]
    )
  ] .

<sourceB> a p:Pipeline, p:ReadableObjectMode ;
  p:steps [
    p:stepList (
      [ op:http\/get ( [ code:name "url" ; code:value "https://example.org/b.ttl" ] ) ]
      [ op:formats\/n3\/parse () ]
    )
  ] .

<sourceC> a p:Pipeline, p:ReadableObjectMode ;
  p:steps [
    p:stepList (
      [ op:sparql\/construct (
          [ code:name "query"    ; code:value "CONSTRUCT WHERE { ?s ?p ?o }" ]
          [ code:name "endpoint" ; code:value "https://query.example.org/sparql" ]
        ) ]
    )
  ] .
```

### 7.6 CSVW Workflow (CSV → RDF Data Cube)

```turtle
@base <http://example.org/pipeline/> .
@prefix p:    <https://pipeline.described.at/> .
@prefix code: <https://code.described.at/> .
@prefix op:   <https://barnard59.zazuko.com/operations/> .

<main> a p:Pipeline ;
  p:variables [
    p:variable
      [ a p:Variable ; p:name "csvw"     ; p:value "data/observations.csv-metadata.json" ] ,
      [ a p:Variable ; p:name "observer" ; p:value "https://example.org/org/my-org"       ]
  ] ;
  p:steps [
    p:stepList (
      [ op:csvw\/fetch ( [ code:name "csvw" ; code:value "csvw"^^p:VariableName ] ) ]
      [ op:formats\/csvw\/parse ( [ code:name "metadata" ; code:value <parseMetadata> ] ) ]
      [ op:rdf\/splitDataset\/bySubject () ]
      [ op:cube\/toObservation (
          [ code:name "observer" ; code:value "observer"^^p:VariableName ]
        ) ]
      [ op:cube\/buildCubeShape (
          [ code:name "metadata" ; code:value <cubeMeta> ]
        ) ]
      [ op:base\/flatten () ]
      [ op:formats\/ntriples\/serialize () ]
      [ op:core\/fs\/createWriteStream ( "output.nt" ) ]
    )
  ] .

<parseMetadata> a p:Pipeline, p:ReadableObjectMode ;
  p:steps [
    p:stepList (
      [ op:core\/fs\/createReadStream ( "csvw"^^p:VariableName ) ]
      [ op:formats\/jsonld\/parse () ]
    )
  ] .

<cubeMeta> a p:Pipeline, p:ReadableObjectMode ;
  p:steps [
    p:stepList (
      [ op:core\/fs\/createReadStream ( "data/cube-shape.ttl" ) ]
      [ op:formats\/n3\/parse () ]
    )
  ] .
```

### 7.7 SFTP Fetch → Local File

```turtle
@base <http://example.org/pipeline/> .
@prefix p:    <https://pipeline.described.at/> .
@prefix code: <https://code.described.at/> .
@prefix op:   <https://barnard59.zazuko.com/operations/> .

<fetch> a p:Pipeline, p:ReadableObjectMode ;
  p:variables [
    p:variable
      [ a p:Variable ; p:name "SSH_HOST" ; p:value "sftp.example.org" ] ,
      [ a p:Variable ; p:name "SSH_USER" ; p:value "anonymous"         ] ,
      [ a p:Variable ; p:name "SSH_PORT" ; p:value "22"                ] ,
      [ a p:Variable ; p:name "SFTP_DIR" ; p:value "/data"             ] ,
      [ a p:Variable ; p:name "outputFolder" ; p:value "input"         ]
  ] ;
  p:steps [
    p:stepList (
      [ op:ftp\/list (
          [ code:name "protocol" ; code:value "sftp"                          ]
          [ code:name "host"     ; code:value "SSH_HOST"^^p:VariableName      ]
          [ code:name "port"     ; code:value "SSH_PORT"^^p:VariableName      ]
          [ code:name "user"     ; code:value "SSH_USER"^^p:VariableName      ]
          [ code:name "pathname" ; code:value "SFTP_DIR"^^p:VariableName      ]
        ) ]
      [ op:base\/forEach ( <fetchFile> "filename" ) ]
    )
  ] .

<fetchFile> a p:Pipeline ;
  p:steps [
    p:stepList (
      [ op:ftp\/read (
          [ code:name "protocol" ; code:value "sftp"                     ]
          [ code:name "host"     ; code:value "SSH_HOST"^^p:VariableName ]
          [ code:name "port"     ; code:value "SSH_PORT"^^p:VariableName ]
          [ code:name "user"     ; code:value "SSH_USER"^^p:VariableName ]
          [ code:name "filename" ; code:value "filename"^^p:VariableName ]
        ) ]
      [ op:core\/fs\/createWriteStream (
          "${outputFolder}/${filename.split('/').slice(-1)[0]}"^^code:EcmaScriptTemplateLiteral
        ) ]
    )
  ] .
```

### 7.8 RDF Validation with SHACL

```turtle
@base <http://example.org/pipeline/> .
@prefix p:    <https://pipeline.described.at/> .
@prefix code: <https://code.described.at/> .
@prefix op:   <https://barnard59.zazuko.com/operations/> .

<validate> a p:Pipeline ;
  p:steps [
    p:stepList (
      [ op:core\/fs\/createReadStream ( "data.ttl" ) ]
      [ op:formats\/n3\/parse () ]
      [ op:shacl\/validate (
          [ code:name "path" ; code:value "shapes.ttl" ]
        ) ]
      [ op:core\/fs\/createWriteStream ( "report.ttl" ) ]
    )
  ] .
```

---

## 8. Sub-Pipeline Composition

### 8.1 Inline Sub-Pipelines

Sub-pipelines are full `p:Pipeline` resources referenced by IRI. They must declare their stream type:

```turtle
<subPipeline> a p:Pipeline, p:ReadableObjectMode ;
  p:steps [ p:stepList ( ... ) ] .
```

Use them as:
- Arguments to `op:base/forEach` — called per chunk
- Arguments to `op:base/concat/object` — concatenated in sequence
- Arguments to `op:formats/csvw/parse` (metadata pipeline)
- Arguments to `op:cube/buildCubeShape` (metadata pipeline)

### 8.2 Shared Variable Blocks

Multiple pipelines can share variables via a named blank node:

```turtle
<sharedVars>
  p:variable
    [ a p:Variable ; p:name "endpoint" ; p:value "http://localhost:3030/data" ] ,
    [ a p:Variable ; p:name "graph"    ; p:value "https://example.org/graph"  ] .

<pipeline1> a p:Pipeline ; p:variables <sharedVars> ; p:steps [ ... ] .
<pipeline2> a p:Pipeline ; p:variables <sharedVars> ; p:steps [ ... ] .
```

### 8.3 forEach Pattern Details

`forEach` calls a sub-pipeline for each incoming chunk. The chunk value is injected as a variable:

```turtle
[ op:base\/forEach ( <subPipeline> "chunkVariable" ) ]
```

The sub-pipeline accesses the chunk via `"chunkVariable"^^p:VariableName`. Common use: glob filenames → forEach → open + parse each file.

---

## 9. Custom JavaScript Steps

### 9.1 Inline EcmaScript Literal

For simple one-liner transforms, embed JS directly in the pipeline:

```turtle
[ op:base\/map (
    """quad => {
      // transform each quad
      return quad
    }"""^^code:EcmaScript
  ) ]
```

Access variables via `this.variables.get('name')` in the function body.

### 9.2 External Module Reference

Reference an exported function from a local file:

```turtle
<myStep> a p:Step ;
  code:implementedBy [ a code:EcmaScriptModule ;
    code:link <file:../lib/myTransform.js#default>
  ] ;
  code:arguments [
    code:name "option" ;
    code:value "value"
  ] .
```

The file must export a factory function returning a stream or async generator:

```js
// lib/myTransform.js
export default function myTransform({ option }) {
  return async function* (stream) {
    for await (const chunk of stream) {
      yield transformChunk(chunk, option)
    }
  }
}
```

**Note:** Async generators and through2 transforms create Duplex streams — they **cannot** be the first step (must be preceded by a Readable source).

### 9.3 EcmaScriptModule Reference (as argument)

Pass a module export as an argument to operations like `op:base/map` or `op:base/filter`:

```turtle
[ op:base\/filter (
    [ a code:EcmaScriptModule ;
      code:link <file:../lib/filters.js#isValidQuad>
    ]
  ) ]
```

---

## 10. Validation

### 10.1 Syntax Validation

Check Turtle syntax (requires `sop` tool):
```bash
sop parse -m "*.ttl"
```

### 10.2 Stream Type Validation

Check stream type compatibility and code link resolution:
```bash
barnard59-validate pipeline.ttl
barnard59-validate pipeline.ttl --pipeline <#main>  # specific pipeline
barnard59-validate pipeline.ttl -v                  # verbose output
```

The validator checks:
- Stream type compatibility between consecutive steps
- Pipeline type matches first/last step types
- Code links resolve to existing exports
- Referenced sub-pipelines exist

### 10.3 Common Validation Errors

| Error | Cause | Fix |
|-------|-------|-----|
| Stream type mismatch | `ReadableObjectMode` → `Writable` | Add serializer step between them |
| First step not readable | Pipeline starts with `Writable` step | Start with a source operation |
| Missing code link | `node:barnard59-foo` not installed | Check package is in `node_modules` |
| Unresolved sub-pipeline | Referenced IRI not defined | Ensure sub-pipeline is defined in same or imported file |

---

## 11. Anti-Patterns to Avoid

1. **Connecting bytes to object-mode without a parser:**
   ```
   op:http/get → op:rdf/setGraph  ❌  (Readable → WritableObjectMode)
   ```
   Fix: insert `op:formats/n3/parse` between them.

2. **Forgetting to flatten after operations that produce arrays:**
   `op:cube/buildCubeShape` and `op:cube/toObservation` produce datasets; add `op:base/flatten` to get individual quads.

3. **Using unescaped slashes in simplified syntax:**
   ```turtle
   [ op:formats/n3/parse () ]   ❌  (IRI collision)
   [ op:formats\/n3\/parse () ] ✅
   ```

4. **Serializing before Graph Store upload:**
   Graph Store operations expect `WritableObjectMode` (quads). Do not serialize to bytes before `op:graph-store/put`.
   ```
   → ReadableObjectMode → op:formats/ntriples/serialize → op:graph-store/put  ❌
   → ReadableObjectMode → op:graph-store/put                                  ✅
   ```

5. **Missing `p:ReadableObjectMode` on sub-pipelines used as quad sources:**
   Sub-pipelines passed to `concat/object` or `forEach` that produce quads must declare `p:ReadableObjectMode`.

---

## 12. Quick-Reference Checklist

Before finalizing a generated pipeline, verify:

- [ ] All required prefixes are declared (`p:`, `code:`, `op:`)
- [ ] `@base` is set if using relative IRIs like `<#pipeline>`
- [ ] Every step connection respects stream type compatibility
- [ ] Pipeline type declaration (`p:Readable`, `p:Writable`, etc.) matches first/last steps
- [ ] All slashes in simplified syntax operation IRIs are escaped (`\/`)
- [ ] Variables are declared before use; `p:VariableName` datatype is used correctly
- [ ] Sub-pipelines declare their stream types (`p:ReadableObjectMode`, etc.)
- [ ] `op:base/flatten` follows operations that produce datasets (cube, splitDataset)
- [ ] No byte-to-object-mode connections without a parser in between
- [ ] Graph Store operations receive quads (not bytes)
