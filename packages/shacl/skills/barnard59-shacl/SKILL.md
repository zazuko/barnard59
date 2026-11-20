---
name: barnard59-shacl
description: Use when validating RDF datasets or emitting and summarizing SHACL reports in Barnard59.
---

# SHACL in pipelines

With `@prefix op: <https://barnard59.zazuko.com/operations/> .`, use predicates such as `op:shacl\/validate`. Both steps take one RDF/JS dataset per input chunk. Group quads with `barnard59-rdf`'s `getDataset` or use an appropriate grouping step. Use a separate readable quad pipeline to load external shapes.

## Pipeline steps

### `validate`

`<node:barnard59-shacl/validate.js#shacl>` imports a required shapes stream and forwards each conforming input dataset. Pass the shape stream positionally, or use named `shape` and `maxErrors`. `maxErrors` limits how many validation errors the validator collects. By default, a nonconforming dataset terminates the stream. In programmatic use, an `onViolation` callback can allow the original dataset to continue. Use `report` when the next step needs the SHACL report datasets.

### `report`

`<node:barnard59-shacl/report.js#shacl>` emits SHACL report datasets. It accepts a positional shape stream or named `shape` and `maxErrors`. Omit the shapes stream to use the shapes present in each input chunk. Here `maxErrors` is a threshold on accumulated `sh:Violation` results across chunks. The pipeline signals failure when it finds violations. Flatten report datasets before passing them to a quad serializer.

## CLI commands

### `shacl validate`

The command reads RDF from stdin and writes the serialized SHACL report. `--shapes` accepts a local RDF path or URL. If you omit it, input data must include the shapes to apply. Use `--shapesMediaType` to override the parser for a remote shapes resource. To validate the pipeline definition itself, use `barnard59-validate` from `barnard59-validation`.

```sh
barnard59 shacl validate --shapes shapes.ttl < data.ttl > report.nt
```

### `shacl report-summary`

This command reads an RDF report from stdin and prints a human-readable summary. Run `barnard59 shacl report-summary < report.nt` after saving a report from a validation pipeline.
