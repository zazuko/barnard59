---
name: barnard59
description: Use when building, running, or troubleshooting Barnard59 RDF ETL pipelines, including Turtle definitions, custom JavaScript or TypeScript steps, CLI invocation, and package selection.
---

# Barnard59 pipelines

Install `barnard59` and the step packages the pipeline uses in the project that owns the pipeline.

## CLI commands

### `barnard59 run`

Run `npx barnard59 run pipeline.ttl` from that project. If the file defines multiple root pipelines, select one by its full IRI with `--pipeline`. Pass each variable with a separate `--variable name=value`. Use `--variable NAME` to read an existing environment variable with that name and `--verbose` for diagnostics. Readable byte output goes to stdout by default. Use `--output result.ext` to capture it to a file.

To expose a project pipeline as a named subcommand with its own options, see `barnard59-local-commands`.

### Run custom TypeScript steps

The public `barnard59` and `b59` launchers automatically select `tsx` when available on PATH, otherwise `ts-node` with its ESM transpile-only loader, then plain Node. Install the loader in the pipeline project so Node can resolve it. For an ESM project using `ts-node`, set `"type": "module"` in `package.json` and use `"module": "NodeNext"` and `"moduleResolution": "NodeNext"` in the TypeScript compiler options. Use the launcher to get loader selection and run `tsc --noEmit` separately for type checking.

### `barnard59-validate`

Run `barnard59-validate pipeline.ttl` from `barnard59-validation` to check the pipeline definition and step compatibility.

## Pipeline steps

### Author a pipeline

- Define a `p:Pipeline` using `https://pipeline.described.at/`. Set `p:steps [ p:stepList (<source> <transform> <sink>) ]` in stream order. Declare pipeline direction and mode with the appropriate `p:Readable`, `p:Writable`, `p:ReadableObjectMode`, or `p:WritableObjectMode` types.
- Define each explicit step as a `p:Step` with `code:implementedBy [ a code:EcmaScriptModule; code:link <node:package/file.js#export> ]`. Use `https://code.described.at/` for `code:`. The fragment names the export. A local step can link to `<./step.ts#default>`.
- Use `code:arguments (arg1 arg2)` for positional arguments. Use repeated `code:arguments [ code:name "key"; code:value value ]` entries for a single options object. Reference a declared `p:Variable` with `"name"^^p:VariableName`. Use `p:required false` for optional variables and typed Turtle literals for booleans and numbers. Mark credentials with `p:sensitive true` to mask their values in pipeline logs.
- Use one `op:` prefix for shorthand operations declared in installed packages' `manifest.ttl` files. Escape each slash after `op:` as `\/` and pass `()` for a step with no arguments.
- To keep step order and arguments in one file and supply implementations or reusable subpipelines from another, see `barnard59-pipeline-imports`.
- Match the data at every boundary: bytes or strings, ordinary objects, individual RDF/JS quads, or datasets and arrays of quads. Parse bytes before graph operations, flatten grouped quads before a quad consumer, and serialize objects or quads before writing to a byte sink.

```turtle
@prefix op: <https://barnard59.zazuko.com/operations/> .
@prefix p: <https://pipeline.described.at/> .

<#convert> a p:Pipeline, p:Readable ;
  p:steps [ p:stepList (
    [ op:core\/fs\/createReadStream ("input.ttl") ]
    [ op:formats\/n3\/parse () ]
    [ op:formats\/ntriples\/serialize () ]
  ) ] .
```

### Custom code

Export a factory that returns a Node stream, a promise resolving to one, or an async generator function for the engine to adapt to a stream. A regular function can access `this.env`, `this.variables`, and `this.logger` from the Barnard59 context. Use `this.env` for RDF/JS terms and datasets.

## Choose a package

Start with the step package's `manifest.ttl` for operation IRIs, implementation links, and any declared stream types. If the manifest declares a CLI command, follow its `b59:source` to a working pipeline, such as `barnard59-graph-store/pipeline/put.ttl`. For more usage examples, check the package README or `packages/cli/examples/` in the repository.

| Package | Capability and skill |
| --- | --- |
| `barnard59` | CLI and manifest discovery. Use this skill to assemble and run pipelines. |
| `barnard59-core` | Programmatic pipeline engine, nested pipelines, variables, and the built-in `node:fs` operation manifest. See `barnard59-files` for local I/O. |
| `barnard59-env` | RDF/JS environment used by the engine and steps, with factories, formats, and Barnard59 namespaces. |
| `barnard59-base` | Streams, JSON, chunk transforms, file discovery, and subpipeline composition. See `barnard59-base`. |
| `barnard59-formats` | CSVW, XLSX, JSON-LD, N3-family and RDF/XML parsing, plus JSON-LD and N-Triples serialization. See `barnard59-formats`. |
| `barnard59-csvw` | Discover CSV data from CSVW metadata. See `barnard59-csvw`. |
| `barnard59-rdf` | Open, group, and transform RDF/JS quads and datasets. See `barnard59-rdf`. |
| `barnard59-http` | HTTP response sources and streaming request bodies. See `barnard59-http`. |
| `barnard59-ftp` | FTP and SFTP listing, reading, writing, and moving. See `barnard59-ftp`. |
| `barnard59-s3` | S3 downloads, uploads, and readable object streams. See `barnard59-s3`. |
| `barnard59-sparql` | Remote SPARQL queries and per-chunk in-memory query/update. See `barnard59-sparql`. |
| `barnard59-graph-store` | Read, append, or replace a graph via the SPARQL Graph Store Protocol. See `barnard59-graph-store`. |
| `barnard59-shacl` | Validate RDF datasets and generate SHACL reports. See `barnard59-shacl`. |
| `barnard59-cube` | Build observations and constraints, fetch cubes, and validate them. See `barnard59-cube`. |
| `barnard59-n3` | Apply N3 inference rules. See `barnard59-n3`. |
| `barnard59-validation` | Pipeline definition and step compatibility checks. |

Try the pipeline against a small representative fixture. Check the actual result and exit status, especially when the last step writes to a file or remote destination.
