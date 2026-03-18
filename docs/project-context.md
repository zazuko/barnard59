# barnard59 LLM Pipeline Generation — Project Context

## What is barnard59?

barnard59 is an RDF/Linked Data ETL (Extract, Transform, Load) pipeline toolkit written in JavaScript (Node.js). Pipelines are defined in RDF (Turtle syntax) using the [pipeline](https://pipeline.described.at/) and [code](https://code.described.at/) ontologies. Steps are chained via Node.js streams (`.pipe()`), just like Unix pipes.

**Repository**: `/Users/ktk/workspace/zazuko/barnard59` (monorepo with 15 packages in `packages/`)

## Current Branch

`feat/llm-instructions` — created for this work.

### Files Created So Far

| File | Status | Description |
|------|--------|-------------|
| `scripts/generate-operations-catalog.js` | ✅ Done | Zero-dependency script that parses all `manifest.ttl` files and generates a Markdown operations catalog |
| `docs/operations-catalog.md` | ✅ Generated | Auto-generated catalog of all ~60 operations with stream types, compatibility rules, and role grouping |
| `docs/llm-instructions.md` | ❌ Not started | The main LLM instructions document (next task) |

## Key Resources

### Documentation (external to this repo)
- **Main docs**: `/Users/ktk/workspace/zazuko/data-centric.zazuko.com/docs/workflows/`
  - `workflows.md` — Introduction / primer
  - `explanations/pipeline.md` — Pipeline concepts (steps, variables, arguments)
  - `explanations/operations.md` — Operations catalog (human-readable list)
  - `explanations/simplified-syntax.md` — Simplified syntax for inline operations
  - `explanations/pipeline-validity.md` — Stream type matching rules
  - `how-to/implement-steps.md` — Implementing custom steps (async generators, through2, raw streams)
  - `tutorial/first-pipeline.mdx` + `first-pipeline.ttl` — Getting started tutorial

### Pipeline Samples
- **~63 real-world pipelines**: `~/tmp/flattened-pipelines/*.ttl`
  - Named by origin: `{org}__{repo}__{path}__filename.ttl`
  - Covers: CSVW workflows, HTTP, FTP/SFTP, Kafka, SPARQL, Graph Store, S3, SHACL, cube building, inline JS, etc.
  - Some use old syntax (verbose `code:EcmaScript` instead of `code:EcmaScriptModule`); the repo source of truth is the current monorepo

### Manifest Files (12 packages with operations)
All at `packages/*/manifest.ttl`:
- **base** — combine, concat, filter, batch, flatten, forEach, glob, json parse/stringify, limit, map, nul, offset, stdout, stdin, toString, streamValues
- **core** — fs/createReadStream, fs/createWriteStream
- **formats** — csvw/parse, jsonld parse/serialize, n3/parse, ntriples/serialize, rdf-xml/parse, xlsx/parse
- **http** — get, post
- **rdf** — mapMatch, setGraph, metadata append/voidStats, fs.js#parse, getDataset, splitDataset (byGraph/byPredicate/bySubject/byType), open, transformCodeImports
- **cube** — buildCubeShape, toObservation (+ CLI commands)
- **csvw** — fetch
- **ftp** — list, move, read, write
- **graph-store** — get, post, put (+ CLI command)
- **s3** — putObject, getObject, getObject/stream
- **shacl** — validate, report (+ CLI commands)
- **sparql** — construct, select, in-memory/update, in-memory/query

### Validation Package
At `packages/validation/`:
- CLI: `barnard59-validate <pipeline.ttl> [-p <pipelineIRI>] [-v] [-q] [-s]`
- Checks: stream type compatibility between consecutive steps, pipeline type matching first/last steps, code link resolution, dependency existence
- Parser logic: `lib/parser.js` — the core validation logic
- RDF syntax validation alternative: `sop parse -m "*.ttl"`

## Stream Type System

Operations declare stream types that determine compatibility:

| Type | Meaning |
|------|---------|
| `Readable` | Produces raw byte chunks |
| `ReadableObjectMode` | Produces objects (typically RDF/JS Quads) |
| `Writable` | Consumes raw byte chunks |
| `WritableObjectMode` | Consumes objects (typically RDF/JS Quads) |

**Rules:**
- `Readable` → `Writable` ✅
- `ReadableObjectMode` → `WritableObjectMode` ✅
- `Readable` → `WritableObjectMode` ❌
- `ReadableObjectMode` → `Writable` ❌
- First step must be Readable or ReadableObjectMode (unless single step)
- Pipeline type must match first/last step types

## Pipeline Syntax

### Simplified syntax (preferred)
```turtle
@prefix op: <https://barnard59.zazuko.com/operations/> .

<pipeline> a p:Pipeline, p:Readable ;
  p:steps [
    p:stepList (
      [ op:http\/get ( [ code:name "url" ; code:value "https://example.org" ] ) ]
      [ op:formats\/n3\/parse () ]
      [ op:formats\/ntriples\/serialize () ]
    )
  ] .
```

### Verbose syntax
```turtle
<step> a p:Step ;
  code:implementedBy [ a code:EcmaScriptModule ;
    code:link <node:barnard59-http/get.js#default>
  ] ;
  code:arguments [ code:name "url" ; code:value "https://example.org" ] .
```

## What Needs To Be Done

### Phase 1: LLM Instructions Document (NEXT)
Create `docs/llm-instructions.md` — a comprehensive document that an LLM can consume to generate valid barnard59 pipelines. Should include:

1. Brief primer on barnard59
2. **Operations catalog** — embed or reference `docs/operations-catalog.md` (auto-generated from manifests, so they stay in sync)
3. Stream compatibility rules (the 4 rules above)
4. Pipeline syntax reference — both simplified (preferred) and verbose
5. Common patterns / recipe book:
   - File → parse → serialize → File
   - File → parse → setGraph → graphStorePut
   - HTTP GET → parse → serialize
   - Glob → forEach(sub-pipeline) → serialize → write
   - concat(multiple sources) → output
   - CSVW workflow (observations + dimensions + cube shapes)
6. Variable system — declaration, `p:VariableName`, template literals, CLI overrides
7. Sub-pipeline composition — forEach, concat, inline sub-pipelines
8. Custom JS steps — inline `code:EcmaScript` and external modules
9. Validation — how to validate generated pipelines

### Phase 2: Auto-Generated Docs Maintenance
- `scripts/generate-operations-catalog.js` is already working
- Consider adding an npm script to regenerate catalog when manifests change
- The LLM instructions should reference (not duplicate) the auto-generated catalog

### Phase 3: Validation-in-the-Loop Testing
Create test pipelines (valid + invalid) to verify LLM-generated pipelines:

| Test | Description | Expected |
|------|-------------|----------|
| `valid-http-to-file.ttl` | HTTP GET → parse N3 → serialize NTriples → write file | ✅ Valid |
| `valid-glob-foreach.ttl` | Glob files → forEach sub-pipeline → serialize → write | ✅ Valid |
| `valid-sparql-construct.ttl` | SPARQL construct → setGraph → graphStorePut | ✅ Valid |
| `invalid-mode-mismatch.ttl` | Readable followed by WritableObjectMode | ❌ Stream mismatch |
| `invalid-missing-readable.ttl` | Pipeline starts with Writable step | ❌ First step not readable |

**Workflow**: Give LLM the instructions → LLM generates pipelines → validate with `barnard59-validate` → iterate on instructions based on failures

### Phase 4: Novel Pipeline Ideas
Once LLM can reliably generate valid pipelines:
- API → RDF (any REST API via JSON-LD contexts)
- Multi-source cube (multiple CSV/Excel → RDF data cube)
- RDF validation (read → SHACL validate → serialize report)
- Data migration (SPARQL endpoint → transform → another endpoint)
- RDF enrichment (read → SPARQL CONSTRUCT → merge → output)

## Technical Notes

- The repo uses **ESM modules** (`"type": "module"`)
- Node.js dependencies are **NOT installed** (no `node_modules`). Run `npm install` first if needed for validation testing
- The `generate-operations-catalog.js` script has **zero external dependencies** — it works without npm install
- Manifests use `@base` IRIs; the script handles relative IRI resolution
- Some sample pipelines use old syntax (`code:EcmaScript` instead of `code:EcmaScriptModule`); the current repo is the source of truth
